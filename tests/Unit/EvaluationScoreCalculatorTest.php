<?php

use App\Services\EvaluationScoreCalculator;

it('calculates weighted evaluation scores', function () {
    $calculator = new EvaluationScoreCalculator;

    expect($calculator->weightedScore(score: 8, maxScore: 10, weight: 60))->toBe(48.0)
        ->and($calculator->weightedScore(score: 6, maxScore: 10, weight: 40))->toBe(24.0)
        ->and($calculator->weightedScore(score: 7.5, maxScore: 10, weight: 33.33))->toBe(25.0);
});
