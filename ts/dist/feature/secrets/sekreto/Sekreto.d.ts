import { Provider, ProviderSpec } from './Providers';
/** A secret name: dot-separated lowercase segments, e.g. `api.token`. */
export type Name = string;
export type SekretoOptions = {
    /** The provider chain, in resolution order. */
    providers?: (Provider | ProviderSpec)[];
    /** Cache resolved values (default: true). */
    cache?: boolean;
};
/** Anything sekreto refuses to do: a bad name, a missing secret, a
 * provider that could not be reached. */
export declare class SekretoError extends Error {
    constructor(message: string);
}
/** Is this a well-formed secret name? */
export declare function validname(name: any): boolean;
export declare function checkname(name: any): string;
/** The environment-variable key for a name: `api.token` -> `API_TOKEN`. */
export declare function envkey(name: Name, prefix?: string): string;
/** Where a name lives in a KV vault: `api.token` -> `api` / `token`.
 *
 * A single-segment name has no path of its own, so it becomes a secret of
 * that name with the conventional field `value`. */
export declare function vaultref(name: Name): {
    path: string;
    field: string;
};
/** A name flattened to one segment: `api.token` -> `api_token` (GCP
 * Secret Manager, `_`) or `api-token` (Azure Key Vault, `-`).
 *
 * Those stores have no path hierarchy and reject dots in ids, so the
 * dots become the store's conventional separator. With `-` as the
 * separator, underscores flatten too: Azure Key Vault's alphabet is
 * letters, digits and hyphens only, and a valid sekreto name like
 * `with_underscore` must still be representable there. (The resulting
 * `.`/`_` collision mirrors the documented envkey behaviour, where
 * both already map to `_`.) */
export declare function flatname(name: Name, sep: string): string;
/** The AWS SSM Parameter Store name for a name: dots become the path
 * hierarchy, rooted at `/` (or at a prefix): `db.pass.main` ->
 * `/db/pass/main`, or `/app/db/pass/main` under prefix `/app`. */
export declare function awsparam(name: Name, prefix?: string): string;
/** Parse `.env` text into a map of raw keys to values.
 *
 * Deliberately small: `KEY=value`, optional `export`, `#` comments on their
 * own line, and single- or double-quoted values (double quotes also
 * unescape `\n`, `\r`, `\t` and `\\`). A line with no `=` is skipped. */
export declare function parsedotenv(text: string): Record<string, string>;
/** Replace known secret values in text with `[redacted]`.
 *
 * Only values of four characters or more are replaced: shorter ones are
 * too likely to appear in ordinary text, and redacting them would make
 * logs unreadable without making them safer. */
export declare function redact(text: string, values: string[]): string;
/** The secrets facade: a chain of providers plus a cache.
 *
 * Two ways to read. `get` is transparent - it walks the chain and takes
 * the first hit, and the caller never learns which store answered. `getfrom`
 * is directed - it names the store, and only that store is asked. Use the
 * first for ordinary configuration, the second when *which* store holds a
 * secret is part of what you mean. */
export declare class Sekreto {
    private entries;
    private docache;
    private cache;
    private seen;
    constructor(options?: SekretoOptions);
    /** The secret, or a SekretoError if no provider has it. */
    get(name: Name): Promise<string>;
    /** The secret, or undefined if no provider has it. */
    try(name: Name): Promise<string | undefined>;
    /** The secret from one named store, or a SekretoError if that store does
     * not have it. */
    getfrom(store: string, name: Name): Promise<string>;
    /** The secret from one named store, or undefined if that store does not
     * have it.
     *
     * Naming a store that is not in the chain is an error, not a miss: `try`
     * already means "this store may not have it", so it cannot also mean
     * "this store may not exist" without hiding a typo. */
    tryfrom(store: string, name: Name): Promise<string | undefined>;
    private resolve;
    /** Does any provider have this secret? */
    has(name: Name): Promise<boolean>;
    /** Does this named store have this secret? */
    hasin(store: string, name: Name): Promise<boolean>;
    /** Every named secret at once. Missing ones are an error. */
    all(names: Name[]): Promise<Record<string, string>>;
    /** A description of each provider, in resolution order. */
    sources(): string[];
    /** The name of each store that can be named by `getfrom`, in resolution
     * order and without repeats. */
    stores(): string[];
    /** Replace every value this Sekreto has resolved with `[redacted]`.
     *
     * Works whether or not caching is enabled: the redaction list is kept
     * independently of the read cache. */
    redact(text: string): string;
    /** Drop cached values, so the next `get` asks the providers again. */
    refresh(): void;
}
/** Make a Sekreto from options. */
export declare function sekreto(options?: SekretoOptions): Sekreto;
