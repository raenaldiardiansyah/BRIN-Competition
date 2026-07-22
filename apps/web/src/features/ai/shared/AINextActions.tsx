import Link from "next/link";
import type { AINextAction } from "../types";
export function AINextActions({ actions }: { actions: AINextAction[] }) { if (!actions.length) return null; return <section><h2>Langkah berikutnya</h2><ul>{actions.map((action) => <li key={action.id}>{action.href ? <Link href={action.href}>{action.label}</Link> : <span>{action.label}</span>}{action.description ? <p>{action.description}</p> : null}</li>)}</ul></section>; }
