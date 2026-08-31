import { SekretoError, awsparam, checkname, envkey, flatname, parsedotenv, vaultref } from '../Sekreto';
declare function nodemod<T = any>(name: string): T;
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
export { SekretoError, awsparam, checkname, envkey, flatname, parsedotenv, vaultref, };
export { nodemod };
