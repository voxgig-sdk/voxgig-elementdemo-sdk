import { Provider, ProviderSpec } from './support';
export type ProviderDefinition = {
    /** The `kind` a ProviderSpec names. */
    name: string;
    /** What this provider needs of its runtime, so a host can refuse or
     * report before a lookup fails: 'fs', 'fetch', 'crypto', 'process'. */
    needs?: string[];
    /** Build the provider from its declarative spec. */
    define: (spec: ProviderSpec) => Provider;
};
/** Register a provider kind. Called by each provider module at import,
 * so importing the module IS installing it. Re-registering the same name
 * replaces it, which is how a host substitutes an implementation. */
export declare function register(def: ProviderDefinition): void;
export declare function registered(kind: string): ProviderDefinition | undefined;
export declare function kinds(): string[];
/** Build a provider from its spec.
 *
 * An UNREGISTERED kind is not the same failure as an unknown one, and the
 * message says which: a kind sekreto has never heard of is a typo, while
 * a known kind that was not imported is the leanness mechanism working as
 * designed and telling you to import it. Collapsing the two was the first
 * thing that made the split confusing to use. */
export declare function makeprovider(spec: ProviderSpec): Provider;
