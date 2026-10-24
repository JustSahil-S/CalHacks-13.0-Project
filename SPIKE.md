# Friday-night spike tests

Module: `server/src/index.ts` (SpacetimeDB 2.13, TypeScript). Type-checks with `npx tsc -p server`.

## Run it

1. Install the CLI (PowerShell): `iwr https://windows.spacetimedb.com -useb | iex`, then open a new terminal.
2. Start a local server in its own terminal: `spacetime start`
3. Publish the module: `spacetime publish fork --module-path server`
   (if the flag name differs in 2.13, check `spacetime publish --help`).
4. Give the module the Claude key. The module declares an `ANTHROPIC_API_KEY` environment
   variable; find the command that sets it in `spacetime --help` (look for env / environment).
   Never commit the key.

## Test 1: ticking

```
spacetime call fork start_ticks 1000
spacetime sql fork "SELECT * FROM tick_log"
spacetime call fork stop_ticks
```

Pass: about one `tick_log` row per second.

## Test 2: one LLM call

```
spacetime call fork queue_llm one 1 "You are Maya, a grad student who visits Blue Door Cafe 4 times a week and orders an oat latte. Yesterday the oat latte went from $5.50 to $6.50. Joe's Coffee next door sells one for $5.75. Give the odds of what you do tomorrow, your satisfaction if you visit (1-5), and a one-line memory."
spacetime sql fork "SELECT * FROM llm_result"
```

Pass: `ok = true` and `output` is JSON with the three odds.

## Test 3: are calls parallel?

```
spacetime call fork queue_llm par 5 "<same prompt>"
spacetime sql fork "SELECT started_ms, finished_ms FROM llm_result WHERE batch = 'par'"
```

Pass (keep procedures): the five time windows overlap.
Fail (switch to the Node brain worker): each call starts after the previous one finishes.
