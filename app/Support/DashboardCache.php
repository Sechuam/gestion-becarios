<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\Cache;

class DashboardCache
{
    private const VERSION_KEY = 'dashboard:cache-version';

    public static function key(User $user, string $role): string
    {
        return 'dashboard:v'.self::version().":{$user->id}:{$role}";
    }

    public static function refresh(): void
    {
        Cache::forever(self::VERSION_KEY, self::version() + 1);
    }

    private static function version(): int
    {
        return (int) Cache::get(self::VERSION_KEY, 1);
    }
}
