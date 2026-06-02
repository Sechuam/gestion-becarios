<?php

namespace App\Providers;

use App\Models\Absence;
use App\Models\CalendarEvent;
use App\Models\EducationCenter;
use App\Models\Evaluation;
use App\Models\EvaluationCriterion;
use App\Models\Intern;
use App\Models\InternalNote;
use App\Models\Message;
use App\Models\MessageConversation;
use App\Models\PracticeType;
use App\Models\ReportTemplate;
use App\Models\Schedule;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\TimeLog;
use App\Models\User;
use App\Observers\BroadcastsModelChanges;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureRealtimeBroadcasting();

        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    protected function configureRealtimeBroadcasting(): void
    {
        foreach ([
            Absence::class,
            CalendarEvent::class,
            EducationCenter::class,
            Evaluation::class,
            EvaluationCriterion::class,
            Intern::class,
            InternalNote::class,
            Message::class,
            MessageConversation::class,
            PracticeType::class,
            ReportTemplate::class,
            Schedule::class,
            Task::class,
            TaskComment::class,
            TimeLog::class,
            User::class,
        ] as $model) {
            $model::observe(BroadcastsModelChanges::class);
        }
    }
}
