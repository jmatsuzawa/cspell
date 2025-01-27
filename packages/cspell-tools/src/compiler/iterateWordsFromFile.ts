import type { ReaderOptions } from './Reader';
import { createReader } from './Reader';

export async function streamWordsFromFile(filename: string, options: ReaderOptions): Promise<Iterable<string>> {
    const reader = await createReader(filename, options);
    return reader;
}
