"use client";
import Jung56Client from "./Jung56Client";
import content from "@/lib/questionnaires/jung56Content.json";
import { getJung56ResultReading } from "@/lib/questionnaires/result-content/jung56-readings";

/** This module, its bank and its full readings load only after choosing 56. */
export default function Jung56EditionClient(props: Parameters<typeof Jung56Client>[0]) {
  const readings = props.readings ?? content.cards.map(card => {
    const reading = getJung56ResultReading(card.id);
    if (!reading) throw new Error("This edition’s complete reading is unavailable");
    return reading;
  });
  return <Jung56Client {...props} readings={readings} />;
}
