import { describe, expect, it } from 'vitest';
import { FINDABLE_MATCH_COMBO_SHARDS, FINDABLE_MATCH_SCORE } from './contracts';
import { getFindableRewardText, getFindableRows } from './findables';

describe('REG-049 findable reward copy', () => {
    it('keeps reward rows aligned with scoring constants', () => {
        expect(getFindableRows()).toEqual([
            {
                id: 'shard_spark',
                label: 'Shard spark',
                rewardText: '+1 combo shard',
                score: FINDABLE_MATCH_SCORE.shard_spark,
                comboShards: FINDABLE_MATCH_COMBO_SHARDS.shard_spark,
                destroyText: 'Destroy forfeits the shard.'
            },
            {
                id: 'score_glint',
                label: 'Score glint',
                rewardText: '+25 score',
                score: FINDABLE_MATCH_SCORE.score_glint,
                comboShards: FINDABLE_MATCH_COMBO_SHARDS.score_glint,
                destroyText: 'Destroy forfeits the score glint.'
            }
        ]);
        expect(getFindableRewardText('shard_spark')).toBe('Shard spark pickup: +1 combo shard.');
        expect(getFindableRewardText('score_glint')).toBe('Score glint pickup: +25 score.');
    });
});
