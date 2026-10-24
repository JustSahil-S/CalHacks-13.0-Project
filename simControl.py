from uploadBusiness import call_reducer, query_sql

HELP = """Commands:
  personas [count]        create customer agents from this business's reviews (default 4)
  +<minutes>              advance time, e.g. +15 or +120
  set wait=<minutes> price=<multiplier> food=<0-1> atmosphere=<0-1>
  reset                   restart the simulation at minute 0 with the same agents
  agents                  list agents and what they are doing
  quit"""


def escape(value):
    return value.replace("'", "''")


def choose_business():
    businesses = query_sql("SELECT place_id, name FROM business")
    for i, b in enumerate(businesses, 1):
        print(f"{i}. {b['name']}")
    return businesses[int(input("Pick a business: ")) - 1]


def print_agents(place_id):
    states = {s["agent_id"]: s for s in query_sql(f"SELECT * FROM agent_state WHERE place_id = '{escape(place_id)}'")}
    for agent in query_sql(f"SELECT * FROM customer_agent WHERE place_id = '{escape(place_id)}'"):
        state = states.get(agent["agent_id"], {})
        print(f"  {agent['name']} ({agent['archetype']}) - {state.get('activity')}, mood {state.get('mood', 0):.2f}, "
              f"patience {agent['patience_minutes']} min")


def print_new_events(place_id, after_event_id):
    events = query_sql(f"SELECT * FROM agent_event WHERE place_id = '{escape(place_id)}'")
    names = {a["agent_id"]: a["name"] for a in query_sql(
        f"SELECT agent_id, name FROM customer_agent WHERE place_id = '{escape(place_id)}'")}
    newest = after_event_id
    for event in sorted(events, key=lambda e: e["event_id"]):
        if event["event_id"] <= after_event_id:
            continue
        hours, minutes = divmod(event["sim_minute"], 60)
        stars = f" {event['stars']}/5" if event["stars"] else ""
        print(f"  [{hours:02d}:{minutes:02d}] {names.get(event['agent_id'], '?')} {event['kind']}{stars} {event['text']}")
        newest = event["event_id"]
    return newest


def update_settings(place_id, args):
    sim = query_sql(f"SELECT * FROM simulation WHERE place_id = '{escape(place_id)}'")[0]
    keys = {"wait": "wait_minutes", "price": "price_multiplier", "food": "food_quality", "atmosphere": "atmosphere_quality"}
    for arg in args:
        key, value = arg.split("=")
        sim[keys[key]] = float(value)
    sim["wait_minutes"] = int(sim["wait_minutes"])
    del sim["sim_minute"]
    call_reducer("update_simulation_settings", sim)
    print(f"  {sim}")


if __name__ == "__main__":
    business = choose_business()
    place_id = business["place_id"]
    last_event_id = 0
    print(HELP)

    while True:
        command, *args = (input(f"{business['name']}> ").strip() or "help").split()
        try:
            if command == "personas":
                count = call_reducer("generate_personas", {"place_id": place_id, "count": int(args[0]) if args else 4})
                print(f"  Created {count} agents")
                print_agents(place_id)
                last_event_id = 0
            elif command.startswith("+"):
                call_reducer("advance_time", {"place_id": place_id, "minutes": int(command[1:])})
                last_event_id = print_new_events(place_id, last_event_id)
            elif command == "set":
                update_settings(place_id, args)
            elif command == "reset":
                call_reducer("reset_simulation", {"place_id": place_id})
                last_event_id = 0
            elif command == "agents":
                print_agents(place_id)
            elif command == "quit":
                break
            else:
                print(HELP)
        except Exception as error:
            print(f"  Error: {error}")
