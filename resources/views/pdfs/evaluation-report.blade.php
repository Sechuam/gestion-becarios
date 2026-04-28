<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Informe de Evaluación</title>
    <style>
        body {
            font-family: 'Helvetica', sans-serif;
            color: #334155;
            font-size: 12px;
        }

        .header {
            text-align: center;
            margin-bottom: 28px;
            border-bottom: 2px solid #1f4f52;
            padding-bottom: 12px;
        }

        .header h1 {
            margin: 0;
            color: #1f4f52;
            font-size: 24px;
        }

        .header p {
            margin: 6px 0 0;
            color: #64748b;
        }

        .info-section {
            margin-bottom: 22px;
        }

        .info-grid {
            width: 100%;
            border-collapse: collapse;
        }

        .info-grid td {
            padding: 6px 8px;
            vertical-align: top;
        }

        .label {
            width: 130px;
            font-weight: bold;
            color: #475569;
        }

        .summary {
            width: 100%;
            margin: 22px 0;
            border-collapse: collapse;
        }

        .summary td {
            width: 33.33%;
            border: 1px solid #e2e8f0;
            padding: 14px;
            text-align: center;
        }

        .summary .metric {
            display: block;
            font-size: 20px;
            font-weight: bold;
            color: #1f2937;
            margin-top: 6px;
        }

        .summary .caption {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: .08em;
            color: #64748b;
            font-weight: bold;
        }

        .comments {
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            padding: 14px;
            margin-bottom: 22px;
        }

        .comments-title {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: .08em;
            color: #64748b;
            font-weight: bold;
            margin-bottom: 10px;
        }

        table.main-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        table.main-table th {
            background-color: #f8fafc;
            color: #475569;
            font-weight: bold;
            text-align: left;
            padding: 10px;
            border: 1px solid #e2e8f0;
            font-size: 11px;
        }

        table.main-table td {
            padding: 10px;
            border: 1px solid #e2e8f0;
            vertical-align: top;
        }

        .muted {
            color: #64748b;
            font-size: 10px;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>INFORME DE EVALUACIÓN</h1>
        <p>Seguimiento del desempeño del becario</p>
    </div>

    <div class="info-section">
        <table class="info-grid">
            <tr>
                <td class="label">Becario:</td>
                <td>{{ $evaluation->intern?->user?->name ?? '—' }}</td>
                <td class="label">Tipo:</td>
                <td>
                    @switch($evaluation->evaluation_type)
                        @case('weekly')
                            Semanal
                            @break
                        @case('monthly')
                            Mensual
                            @break
                        @case('final')
                            Final
                            @break
                        @case('self')
                            Autoevaluación
                            @break
                        @default
                            {{ $evaluation->evaluation_type }}
                    @endswitch
                </td>
            </tr>
            <tr>
                <td class="label">Evaluador:</td>
                <td>{{ $evaluation->evaluator?->name ?? ($evaluation->intern?->user?->name ?? '—') }}</td>
                <td class="label">Módulo:</td>
                <td>{{ $evaluation->intern?->academic_degree ?? '—' }}</td>
            </tr>
            <tr>
                <td class="label">Fecha:</td>
                <td>{{ optional($evaluation->evaluated_at)->format('d/m/Y') ?? '—' }}</td>
                <td class="label">Período:</td>
                <td>
                    {{ optional($evaluation->period_start)->format('d/m/Y') ?? '—' }}
                    a
                    {{ optional($evaluation->period_end)->format('d/m/Y') ?? '—' }}
                </td>
            </tr>
        </table>
    </div>

    <table class="summary">
        <tr>
            <td>
                <span class="caption">Nota ponderada</span>
                <span class="metric">{{ $evaluation->weighted_score ?? '—' }}</span>
            </td>
            <td>
                <span class="caption">Puntuación total</span>
                <span class="metric">{{ $evaluation->total_score ?? '—' }}</span>
            </td>
            <td>
                <span class="caption">Criterios evaluados</span>
                <span class="metric">{{ $evaluation->scores->count() }}</span>
            </td>
        </tr>
    </table>

    <div class="comments">
        <div class="comments-title">Comentario general</div>
        <div>
            {{ $evaluation->general_comments ?: 'No se han añadido observaciones generales para esta evaluación.' }}
        </div>
    </div>

    @if(count($history ?? []) > 1)
    <div style="margin: 22px 0; page-break-inside: avoid;">
        <h3 style="font-size: 12px; font-weight: bold; color: #475569; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.08em;">Evolución histórica</h3>
        <svg width="100%" height="200" style="border: 1px solid #e2e8f0; background-color: #f8fafc;">
            @php
                $validHistory = collect($history ?? [])->filter(fn($h) => $h['weighted_score'] !== null)->values();
                $maxScore = $validHistory->max('weighted_score') ?? 10;
                $minScore = min($validHistory->min('weighted_score') ?? 0, 0);
                $range = max($maxScore - $minScore, 1);
                
                $padding = 30;
                $width = 600;
                $height = 140;
                $graphWidth = $width - (2 * $padding);
                $graphHeight = $height - (2 * $padding);
                
                $xStep = $validHistory->count() > 1 ? $graphWidth / ($validHistory->count() - 1) : 0;
                $points = [];
                
                foreach ($validHistory as $index => $item) {
                    $x = $padding + ($index * $xStep);
                    $y = $padding + $graphHeight - (($item['weighted_score'] - $minScore) / $range * $graphHeight);
                    $points[] = "$x,$y";
                }
                
                $polyline = implode(' ', $points);
            @endphp
            
            <!-- Grid lines -->
            <line x1="{{ $padding }}" y1="{{ $padding }}" x2="{{ $padding }}" y2="{{ $padding + $graphHeight }}" stroke="#e2e8f0" stroke-width="1"/>
            <line x1="{{ $padding }}" y1="{{ $padding + $graphHeight }}" x2="{{ $padding + $graphWidth }}" y2="{{ $padding + $graphHeight }}" stroke="#e2e8f0" stroke-width="1"/>
            
            <!-- Y axis labels -->
            <text x="15" y="{{ $padding + 5 }}" font-size="10" fill="#64748b" text-anchor="end">{{ number_format($maxScore, 1) }}</text>
            <text x="15" y="{{ $padding + $graphHeight + 5 }}" font-size="10" fill="#64748b" text-anchor="end">{{ number_format($minScore, 1) }}</text>
            
            <!-- Polyline for evolution -->
            <polyline points="{{ $polyline }}" stroke="#1f4f52" stroke-width="2" fill="none"/>
            
            <!-- Points and labels -->
            @foreach($validHistory as $index => $item)
                @php
                    $x = $padding + ($index * $xStep);
                    $y = $padding + $graphHeight - (($item['weighted_score'] - $minScore) / $range * $graphHeight);
                    $dateShort = $item['evaluated_at'] ? \Carbon\Carbon::parse($item['evaluated_at'])->format('d/m') : '—';
                @endphp
                <circle cx="{{ $x }}" cy="{{ $y }}" r="3" fill="{{ $item['is_current'] ? '#dc2626' : '#1f4f52' }}"/>
                <text x="{{ $x }}" y="{{ $padding + $graphHeight + 20 }}" font-size="9" fill="#64748b" text-anchor="middle">{{ $dateShort }}</text>
            @endforeach
        </svg>
        <p style="font-size: 10px; color: #64748b; margin-top: 8px; margin-bottom: 0;">
            <strong style="color: #1f4f52;">Leyenda:</strong> Línea ponderada de evaluaciones registradas. Punto rojo = evaluación actual.
        </p>
    </div>
    @endif

    <table class="main-table">
        <thead>
            <tr>
                <th style="width: 24%;">Criterio</th>
                <th style="width: 14%;">Categoría</th>
                <th style="width: 10%;">Nota</th>
                <th style="width: 12%;">Peso</th>
                <th style="width: 12%;">Ponderada</th>
                <th style="width: 28%;">Comentario</th>
            </tr>
        </thead>
        <tbody>
            @foreach($evaluation->scores as $score)
                <tr>
                    <td>
                        <strong>{{ $score->criterion?->name ?? '—' }}</strong>
                        @if($score->criterion?->description)
                            <div class="muted">{{ $score->criterion->description }}</div>
                        @endif
                    </td>
                    <td>{{ $score->criterion?->category ?? '—' }}</td>
                    <td>{{ $score->score }} / {{ $score->criterion?->max_score ?? '—' }}</td>
                    <td>{{ $score->criterion?->weight ?? '—' }}%</td>
                    <td>{{ $score->weighted_score ?? '—' }}</td>
                    <td>{{ $score->comment ?: 'Sin comentario' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>

</html>
