import type { HttpResponse } from 'uWebSockets.js';

/* Helper function for reading a posted JSON body */
export function readBody(
  res: HttpResponse,
  err: (message: string) => Error,
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let buffer: Buffer | undefined;
    /* Register data cb */
    res.onData((ab, isLast) => {
      const chunk = Buffer.from(ab);
      if (isLast) {
        let json;
        if (buffer) {
          try {
            json = JSON.parse(Buffer.concat([buffer, chunk]).toString('utf-8'));
          } catch (e) {
            if (e instanceof Error) {
              return reject(err(e.message));
            }
            return reject(err(JSON.stringify(e)));
          }
          resolve(json);
        } else {
          try {
            json = JSON.parse(chunk.toString('utf-8'));
          } catch (e) {
            if (e instanceof Error) {
              return reject(err(e.message));
            }
            return reject(err(JSON.stringify(e)));
          }
          resolve(json);
        }
      } else {
        if (buffer) {
          buffer = Buffer.concat([buffer, chunk]);
        } else {
          buffer = Buffer.concat([chunk]);
        }
      }
    });
  });
}
