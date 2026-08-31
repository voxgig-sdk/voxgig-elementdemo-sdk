export type Provider = {
    /** The value, or undefined if this provider does not have it. */
    lookup: (name: string) => Promise<string | undefined> | string | undefined;
    /** A short description, shown by `Sekreto.sources()`. */
    describe: () => string;
};
/** The declarative form of a provider, as used in config and in the
 * shared spec. */
export type ProviderSpec = {
    kind: 'env' | 'dotenv' | 'memory' | 'file' | 'hashicorp' | 'boru' | 'awssecrets' | 'awsparams' | 'gcpsecrets' | 'azuresecrets' | 'onepassword' | 'doppler' | 'infisical';
    /** The store name `Sekreto.getfrom` addresses. Defaults to `kind`. */
    name?: string;
    prefix?: string;
    /** dotenv: the file to read. */
    file?: string;
    /** memory: literal values, keyed like environment variables. */
    values?: Record<string, string>;
    /** file: the directory of one-secret-per-file entries. */
    dir?: string;
    /** hashicorp / boru (wire) / gcp / 1password / doppler / infisical:
     * the base URL. */
    addr?: string;
    /** hashicorp / boru (wire) / gcp / azure / 1password / doppler /
     * infisical: the access token. */
    token?: string;
    /** hashicorp / boru (wire): the KV mount (default `secret`). */
    mount?: string;
    /** hashicorp: KV engine version, 1 or 2 (default 2). */
    kv?: number;
    /** hashicorp: Vault Enterprise namespace (X-Vault-Namespace). */
    vaultnamespace?: string;
    /** hashicorp: log in for a token instead of being handed one. */
    auth?: {
        method: 'kubernetes' | 'approle';
        /** The auth mount, defaulting to the method name. */
        mount?: string;
        /** kubernetes: the Vault role to log in as. */
        role?: string;
        /** kubernetes: the service-account JWT itself (tests). */
        jwt?: string;
        /** kubernetes: where the JWT lives; the conventional pod path by
         * default. */
        jwtfile?: string;
        /** approle: the role and secret ids. */
        roleid?: string;
        secretid?: string;
    };
    /** boru: the executable to run (default `boru`). */
    command?: string;
    /** boru: the namespace qualifying the alias. */
    namespace?: string;
    /** boru: the vault home, passed as BORU_HOME. */
    home?: string;
    /** aws: region and credentials; the standard AWS_* environment
     * variables fill whichever are not given. */
    region?: string;
    keyid?: string;
    secret?: string;
    session?: string;
    /** gcp / doppler / infisical: the project (GCP project id, Doppler
     * project slug, Infisical workspace id). */
    project?: string;
    /** azure: the Key Vault name or full URL. 1password: the vault name
     * or id. */
    vault?: string;
    /** azure: client-credential login. infisical: universal-auth login
     * (tenant is Azure-only). */
    tenant?: string;
    clientid?: string;
    clientsecret?: string;
    /** azure: where to log in / where IMDS answers. gcp: where the
     * metadata server answers. Overridable for tests and for clouds with
     * nonstandard endpoints. */
    loginaddr?: string;
    imdsaddr?: string;
    metadataaddr?: string;
    /** azure: the Key Vault API version (default 7.4). */
    apiversion?: string;
    /** doppler: the config slug (with `project`). */
    config?: string;
    /** infisical: the environment slug and secret path. */
    environment?: string;
    path?: string;
};
/** Environment variables: `api.token` from `API_TOKEN`. */
export declare function envprovider(prefix?: string, source?: Record<string, any>): Provider;
/** A `.env` file, read once, keyed exactly like the environment. */
export declare function dotenvprovider(file: string, prefix?: string): Provider;
/** Literal values, keyed like environment variables. The spec uses this
 * to test chain behaviour without touching the outside world. */
export declare function memoryprovider(values: Record<string, string>, prefix?: string): Provider;
/** A directory of one-secret-per-file entries, keyed like the
 * environment: `api.token` reads `<dir>/API_TOKEN`.
 *
 * This is the shape of a mounted Kubernetes Secret, a Docker or Swarm
 * secret, and a systemd credentials directory, so those all work with no
 * further configuration. One trailing newline is stripped - tools that
 * write these files disagree about it, and a newline is never part of a
 * secret on purpose. */
export declare function fileprovider(dir: string, prefix?: string): Provider;
/** Refuse to send a secret-bearing credential in the clear.
 *
 * A vault API is HTTPS in any real deployment; plaintext is a dev-mode
 * convenience. Sending a token over http to anything but the local
 * machine puts both the token and the secret it fetches on the wire for
 * anyone on the path, so sekreto will not do it. Loopback stays allowed:
 * that is `vault server -dev`, `boru vault serve`, and this repo's own
 * test harness. */
export declare function checkaddr(addr: string): void;
/** HashiCorp Vault.
 *
 * KV v2 (the default): `api.token` reads `{addr}/v1/{mount}/data/api`
 * and takes the `token` field of `data.data`. KV v1 (`kv: 1`) reads
 * `{addr}/v1/{mount}/api` and takes the field of `data`. A 404 means
 * "not here" - a miss - so a vault can sit in a chain with fallbacks.
 *
 * A Vault Enterprise namespace rides the X-Vault-Namespace header, on
 * logins as well as reads.
 *
 * Instead of being handed a token, the provider can log in: Kubernetes
 * auth (the pod's service-account JWT, from its conventional path) or
 * AppRole. A failed login is an error, never a miss - it means this
 * store could not answer at all. */
export declare function hashicorpprovider(addr: string, token: string, options?: {
    mount?: string;
    kv?: number;
    vaultnamespace?: string;
    auth?: ProviderSpec['auth'];
}): Provider;
/** A boru vault (https://github.com/boru-lang/boru).
 *
 * Two ways in, both boru's own.
 *
 * With no `addr`, the CLI: `boru vault get --reveal <alias>` prints the
 * secret on stdout and nothing else. The passphrase is read by boru
 * itself from `BORU_VAULT_PASSPHRASE`; sekreto never accepts it as
 * config and never puts it on a command line, where it would show up in
 * the process table.
 *
 * With an `addr`, boru's wire protocol: `boru vault serve` publishes a
 * read-only, HashiCorp-shaped provision API (boru's
 * design/VAULT-WIRE-PROTOCOL.0.md), authenticated by a capability token
 * from `boru vault grant`. A sekreto name is already a valid boru
 * alias, and boru aliases keep their dots, so `api.token` is the single
 * path segment `api.token` - not the `api`/`token` split a HashiCorp KV
 * gets. The value is the `value` field. A 404 is a miss; anything else
 * the server refuses (a revoked capability, a sealed vault) is an
 * error.
 *
 * boru's `vault proxy` and `vault mcp` remain out of bounds: they are a
 * credential *broker*, built precisely so the caller never receives the
 * credential. `vault serve` is the provision endpoint, built to hand
 * the value back - that is the one sekreto uses. */
export declare function boruprovider(options?: {
    command?: string;
    namespace?: string;
    home?: string;
    addr?: string;
    token?: string;
    mount?: string;
}): Provider;
type Awsopts = {
    region?: string;
    keyid?: string;
    secret?: string;
    session?: string;
    addr?: string;
    prefix?: string;
};
/** AWS Secrets Manager.
 *
 * `api.token` reads the secret named `api` (the vaultref path, so
 * `db.pass.main` reads `db/pass`) and takes the `token` field of its
 * JSON SecretString - the AWS idiom of one JSON map per secret. A
 * SecretString that is not JSON is the value itself, under the
 * conventional field `value`. Requests are SigV4-signed in-tree; see
 * Sigv4.ts. */
export declare function awssecretsprovider(options?: Awsopts): Provider;
/** AWS SSM Parameter Store.
 *
 * `db.pass.main` reads the parameter `/db/pass/main` (under an optional
 * prefix path), decrypted. Parameter Store carries flat strings, so
 * there is no field indirection. */
export declare function awsparamsprovider(options?: Awsopts): Provider;
/** GCP Secret Manager.
 *
 * `api.token` reads secret `api_token` (dots flattened to `_`; Secret
 * Manager ids have no hierarchy and reject dots), latest version. The
 * token comes from config, then `GOOGLE_OAUTH_ACCESS_TOKEN`, then the
 * GCE/GKE metadata server - so on Google's own platform no credential
 * configuration is needed at all.
 *
 * The metadata call itself is plain http to a link-local host by
 * platform design; no credential rides on it, so `checkaddr` guards the
 * Secret Manager address instead. */
export declare function gcpsecretsprovider(options?: {
    project?: string;
    token?: string;
    addr?: string;
    metadataaddr?: string;
}): Provider;
/** Azure Key Vault.
 *
 * `api.token` reads secret `api-token` (dots flattened to `-`; Key
 * Vault names allow nothing else), current version. The token comes
 * from config, then a client-credentials login when tenant/clientid/
 * clientsecret are given, then the IMDS managed-identity endpoint - so
 * on Azure's own platform no credential configuration is needed.
 *
 * As with GCP, the IMDS call is plain http to a link-local host by
 * platform design and carries no credential; the login and vault
 * addresses are `checkaddr`-guarded. */
export declare function azuresecretsprovider(options?: {
    vault?: string;
    token?: string;
    tenant?: string;
    clientid?: string;
    clientsecret?: string;
    loginaddr?: string;
    imdsaddr?: string;
    apiversion?: string;
}): Provider;
/** 1Password, through a Connect server.
 *
 * The item titled `api.token` (titles keep their dots), in the named
 * vault. The value is the field with purpose PASSWORD, or the field
 * labelled `value`. A vault that cannot be found is an error - config
 * names it, so its absence is a broken store, not a missing secret. */
export declare function onepasswordprovider(options?: {
    addr?: string;
    token?: string;
    vault?: string;
}): Provider;
/** Doppler.
 *
 * The whole config is downloaded once - Doppler's own bulk endpoint -
 * and answered from memory, like a remote .env: `api.token` is the
 * `API_TOKEN` entry. A service token is config-scoped, so project and
 * config are only needed with broader tokens. */
export declare function dopplerprovider(options?: {
    token?: string;
    project?: string;
    config?: string;
    addr?: string;
}): Provider;
/** Infisical.
 *
 * `api.token` reads the secret keyed `API_TOKEN` (Infisical's own
 * convention is environment-style keys) at a secret path in one
 * environment of a project. Auth is a token, or a universal-auth
 * (machine identity) login with clientid/clientsecret. */
export declare function infisicalprovider(options?: {
    addr?: string;
    token?: string;
    clientid?: string;
    clientsecret?: string;
    project?: string;
    environment?: string;
    path?: string;
}): Provider;
/** Build a provider from its declarative form. */
export declare function makeprovider(spec: ProviderSpec): Provider;
export {};
