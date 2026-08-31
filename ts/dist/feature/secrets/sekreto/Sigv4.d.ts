export type Sigv4Input = {
    method: string;
    /** Full request URL; the host, path and query are signed. */
    url: string;
    /** Extra headers to sign, e.g. content-type and x-amz-target. */
    headers?: Record<string, string>;
    body?: string;
    service: string;
    region: string;
    keyid: string;
    secret: string;
    /** STS session token; signed as x-amz-security-token when present. */
    session?: string;
    /** The signing moment, `YYYYMMDDTHHMMSSZ`. Passed in, never sampled,
     * so the function stays pure. */
    datetime: string;
};
/** The headers to attach to the request: authorization, x-amz-date, and
 * x-amz-security-token when a session token was given. */
export type Sigv4Output = Record<string, string>;
/** Sign one request. Returns the headers to attach. */
export declare function sigv4(input: Sigv4Input): Sigv4Output;
