import { spawnSync } from "node:child_process";
import { realpathSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { describe, expect, it } from "vitest";

type Ast = { type: string; value?: unknown; nodes?: Iterable<Ast>; depth?: number };
type Braces = {
  parse(input: string, options?: Record<string, unknown>): Ast;
  compile(input: unknown, options?: Record<string, unknown>): string;
  expand(input: unknown, options?: Record<string, unknown>): string[];
  stringify(input: unknown, options?: Record<string, unknown>): string;
};
const rootRequire = createRequire(path.join(process.cwd(), "package.json"));
const chains = [
  ["next-sitemap", "fast-glob", "micromatch"],
  ["eslint-config-next", "@next/eslint-plugin-next", "fast-glob", "micromatch"],
  ["@types/jest-axe", "@types/jest", "expect", "jest-message-util", "micromatch"],
];
const locations = chains.map((chain) => {
  let from = rootRequire;
  for (const dependency of chain) {
    let entry: string;
    try { entry = from.resolve(`${dependency}/package.json`); }
    catch { entry = from.resolve(dependency); }
    from = createRequire(entry);
  }
  return realpathSync(from.resolve("braces"));
});
const braces = rootRequire(locations[0]) as Braces;
const nesting = (depth: number, open = "{", close = "}") => open.repeat(depth) + "a,b" + close.repeat(depth);
const ast = (depth: number, sets = false): Ast => {
  let node: Ast = { type: "text", value: "x" };
  for (let i = 0; i < depth; i++) node = { type: "custom", depth: -1, nodes: sets ? new Set([node]) : [node] };
  return { type: "root", nodes: sets ? new Set([node]) : [node] };
};
const rejectsDepth = (run: () => unknown) => {
  expect(run).toThrowError(expect.objectContaining({ name: "SyntaxError", code: "BRACES_MAX_DEPTH_EXCEEDED" }));
};

describe("braces shared recursion boundary", () => {
  it("patches the actual dependency loaded by all three root chains", () => {
    expect(new Set(locations).size).toBe(1);
    for (const location of locations) rejectsDepth(() => (rootRequire(location) as Braces).expand(nesting(129)));
  });

  it.each([["{", "}"], ["(", ")"], ["{(", ")}"]])("bounds structural containers for %s", (open, close) => {
    const count = open.length === 2 ? 64 : 128;
    expect(() => braces.parse(nesting(count, open, close))).not.toThrow();
    for (const method of ["compile", "expand", "stringify"] as const) {
      expect(() => braces[method](nesting(count, open, close))).not.toThrow();
      rejectsDepth(() => braces[method](nesting(count + 1, open, close), { maxDepth: Infinity }));
    }
    rejectsDepth(() => braces.parse(open.repeat(count + 1) + "x"));
  });

  it("bounds direct custom ASTs, cycles and iterable nodes without counting leaves", () => {
    for (const method of ["compile", "expand", "stringify"] as const) {
      expect(() => braces[method](ast(128))).not.toThrow();
      rejectsDepth(() => braces[method](ast(129)));
      const cycle: Ast = { type: "custom", nodes: [] };
      cycle.nodes = [cycle];
      rejectsDepth(() => braces[method]({ type: "root", nodes: [cycle] }));
    }
    for (const method of ["compile", "stringify"] as const) {
      expect(braces[method](ast(128, true))).toBe("x");
      rejectsDepth(() => braces[method](ast(129, true)));
    }
  });

  it("preserves single-use iterators and bounds the nodes actually consumed", () => {
    for (const method of ["compile", "stringify"] as const) {
      function* text() { yield { type: "text", value: "x" }; }
      expect(braces[method]({ type: "root", nodes: text() })).toBe("x");
      let calls = 0;
      const nodes = { *[Symbol.iterator]() { if (++calls > 1) yield ast(10000); } };
      expect(braces[method]({ type: "root", nodes })).toBe("");
      expect(calls).toBe(1);
      function* deep() { yield ast(129); }
      rejectsDepth(() => braces[method]({ type: "root", nodes: deep() }));
    }
    const nodes = [ast(10000)];
    Object.defineProperty(nodes, Symbol.iterator, { value: function* () {} });
    rejectsDepth(() => braces.expand({ type: "root", nodes }));
  });

  it("preserves shallow lists, ranges, literals and existing failure semantics", () => {
    expect(braces.compile("a/{b,c}/d")).toBe("a/(b|c)/d");
    expect(braces.expand("a/{b,c}/d")).toEqual(["a/b/d", "a/c/d"]);
    expect(braces.expand("{01..03}")).toEqual(["01", "02", "03"]);
    expect(braces.expand("{a,a,}", { noempty: true, nodupes: true })).toEqual(["a"]);
    expect(braces.compile("${a,b}")).toBe("${a,b}");
    expect(braces.compile("\\{a,b\\}")).toBe("{a,b}");
    expect(braces.compile("{a", { escapeInvalid: true })).toBe("\\{a");
    const deep = nesting(4990);
    expect(braces.compile(`"${deep}"`)).toBe(deep);
    expect(braces.compile(`[${deep}]`)).toBe(`[${deep}]`);
    expect(() => braces.expand("{1..2000}")).toThrowError(RangeError);
    expect(() => braces.parse("x".repeat(10001))).toThrowError(SyntaxError);
    for (const method of ["compile", "expand", "stringify"] as const) {
      expect(() => braces[method]({ type: "root", nodes: [{ type: "text", value: [["x"]] }] })).toThrowError(TypeError);
    }
  });

  it("rejects the original trigger and forged parent cycles in bounded child processes", () => {
    const code = `const assert=require('node:assert/strict'); const b=require(${JSON.stringify(locations[0])});
      const pattern='{'.repeat(4990)+'a,b'+'}'.repeat(4990);
      for(const method of ['compile','expand','stringify']) assert.throws(()=>b[method](pattern), {name:'SyntaxError',code:'BRACES_MAX_DEPTH_EXCEEDED'});
      let deep={type:'text',value:'x'}; for(let i=0;i<10000;i++)deep={type:'custom',nodes:[deep]};
      const hidden=[deep]; hidden[Symbol.iterator]=function*(){};
      assert.throws(()=>b.expand({type:'root',nodes:hidden}), {name:'SyntaxError',code:'BRACES_MAX_DEPTH_EXCEEDED'});
      for(const method of ['compile','stringify']){function* nodes(){yield deep;} assert.throws(()=>b[method]({type:'root',nodes:nodes()}),{name:'SyntaxError',code:'BRACES_MAX_DEPTH_EXCEEDED'});}
      const parent={type:'custom'}; parent.parent=parent;
      const node={type:'custom',nodes:[],parent};
      assert.throws(()=>b.expand({type:'root',nodes:[node]}), {name:'SyntaxError',code:'BRACES_MAX_DEPTH_EXCEEDED'});`;
    const result = spawnSync(process.execPath, ["--max-old-space-size=64", "-e", code], { timeout: 3000, maxBuffer: 65536, encoding: "utf8" });
    expect(result.error).toBeUndefined();
    expect(result.status, result.stderr).toBe(0);
  });

  it("protects the real fast-glob task preparation path", () => {
    const fromSitemap = createRequire(rootRequire.resolve("next-sitemap"));
    const glob = fromSitemap("fast-glob") as { generateTasks(pattern: string): unknown };
    expect(() => glob.generateTasks("app/{en,zh}/**/*.tsx")).not.toThrow();
    rejectsDepth(() => glob.generateTasks(nesting(4990)));
  });
});
