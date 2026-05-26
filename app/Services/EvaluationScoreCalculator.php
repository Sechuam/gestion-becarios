<?php

namespace App\Services;

class EvaluationScoreCalculator
{
    public function weightedScore(float $score, float $maxScore, float $weight): float
    {
        if ($maxScore <= 0) {
            return 0.0;
        }

        return round(($score / $maxScore) * $weight, 2);
    }
}
