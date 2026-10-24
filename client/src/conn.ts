// Live connection to the Fork database on SpacetimeDB.
import { DbConnection } from './module_bindings';

export const HOST = import.meta.env.VITE_STDB_HOST ?? 'wss://maincloud.spacetimedb.com';
export const DB = import.meta.env.VITE_STDB_DB ?? 'fork-calhacks';
const TOKEN_KEY = `fork-token:${HOST}/${DB}`;

function storedToken(): string | undefined {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

export function connect(handlers: {
  ready: (conn: DbConnection, identityHex: string) => void;
  down: (why: string) => void;
}): void {
  const attempt = (token: string | undefined) => {
    DbConnection.builder()
      .withUri(HOST)
      .withDatabaseName(DB)
      .withToken(token)
      .onConnect((conn, identity, newToken) => {
        try {
          localStorage.setItem(TOKEN_KEY, newToken);
        } catch {
          /* private mode: fine, we just get a new identity next time */
        }
        handlers.ready(conn, identity.toHexString());
      })
      .onConnectError((_ctx, err) => {
        if (token) {
          // A stale token from an older database: drop it and connect fresh.
          try {
            localStorage.removeItem(TOKEN_KEY);
          } catch {
            /* ignore */
          }
          attempt(undefined);
        } else handlers.down(String(err));
      })
      .onDisconnect(() => handlers.down('disconnected'))
      .build();
  };
  attempt(storedToken());
}
