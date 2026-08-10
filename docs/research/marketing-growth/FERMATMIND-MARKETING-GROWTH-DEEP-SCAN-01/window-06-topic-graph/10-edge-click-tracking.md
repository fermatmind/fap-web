# Edge click tracking

Status: **M06_PUBLIC_TOPIC_EDGE_CLICK_CONTRACT_APPROVED_NOT_DEPLOYED**. Window 2 `event_contract.json` approves the single event `public_topic_edge_click` as a contract-only browser observation. Its trigger is a user activating an already rendered, backend-approved public edge.

A01, P03/P04/P05 and R04 are completed registry inputs. G03 governed review, backend Authority, the later renderer and the Career C06 activation gate remain separate dependencies. M06 no longer blocks the measurement contract.

Required fields are `edge_id`, `locale`, `source_surface`, `target_surface`, `relation_type`, `display_region`, `position_bucket` and `target_action`; `entry_surface` and `organic_channel` are optional. Additional fields are rejected. User/anonymous/session identity, attempt/report/order/payment identity, full URL, slug, query string, referrer, answers, scores, free text and payment data are forbidden. The backend-issued edge identity is the only edge identity; tracking parameters never enter canonical identity.

No runtime callsite or consent change is included here, no telemetry is sent, and deployment is not claimed.
