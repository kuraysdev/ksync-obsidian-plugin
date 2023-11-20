export type MatchCondition<V, T> = [V, T];

export default function match<V, T>(currentValue: V, matches: MatchCondition<V, T>[]): T | null {
    for (const [value, result] of matches) {
        if (currentValue == value) {
            if (typeof result == 'function') return result();
            else return result;
        }
    }

    return null;
}