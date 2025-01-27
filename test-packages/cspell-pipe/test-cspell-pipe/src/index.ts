import { reduceSync } from '@cspell/cspell-pipe';
import { reduce } from '@cspell/cspell-pipe/sync';

export function sumValues(numbers: Iterable<number>): number {
    return reduce(numbers, (a, b) => a + b, 0);
}

export function sumValuesSync(numbers: Iterable<number>): number {
    return reduceSync(numbers, (a, b) => a + b, 0);
}
