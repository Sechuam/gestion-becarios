<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Reporte de Asistencia</title>
    <style>
        body {
            font-family: 'Helvetica', sans-serif;
            color: #333;
            font-size: 12px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #4f46e5;
            padding-bottom: 10px;
        }

        .info-section {
            margin-bottom: 20px;
        }

        .info-grid {
            width: 100%;
            border-collapse: collapse;
        }

        .info-grid td {
            padding: 5px;
            vertical-align: top;
        }

        .label {
            font-weight: bold;
            color: #666;
            width: 120px;
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
        }

        table.main-table td {
            padding: 8px;
            border: 1px solid #e2e8f0;
        }

        .total-section {
            margin-top: 30px;
            text-align: right;
            border-top: 2px solid #e2e8f0;
            padding-top: 10px;
        }

        .signatures {
            margin-top: 50px;
            width: 100%;
        }

        .signatures td {
            width: 33%;
            text-align: center;
            padding-top: 50px;
            border-top: 1px solid #999;
            font-size: 10px;
        }

        .weekend {
            background-color: #f1f5f9;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1 style="color: #4f46e5; margin: 0;">REPORTE DE ASISTENCIA</h1>
        <p style="margin: 5px 0;">Seguimiento de Prácticas Académicas Externas</p>
    </div>

    <div class="info-section">
        <table class="info-grid">
            <tr>
                <td class="label">Becario:</td>
                <td>{{ $intern->user->name }} ({{ $intern->dni }})</td>
                <td class="label">Periodo:</td>
                <td>{{ $period_start }} a {{ $period_end }}</td>
            </tr>
            <tr>
                <td class="label">Centro:</td>
                <td>{{ $intern->educationCenter->name }}</td>
                <td class="label">Tutor Empresa:</td>
                <td>{{ $intern->companyTutor->name ?? 'No asignado' }}</td>
            </tr>
        </table>
    </div>

    <table class="main-table">
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Día</th>
                <th>Entrada</th>
                <th>Salida</th>
                <th>Horas</th>
                <th>Observaciones / Ausencia</th>
            </tr>
        </thead>
        <tbody>
            @foreach($days as $day)
                <tr class="{{ $day['is_weekend'] ? 'weekend' : '' }}">
                    <td>{{ $day['date'] }}</td>
                    <td style="text-transform: capitalize;">{{ $day['day_name'] }}</td>
                    <td>{{ $day['clock_in'] ?? '--:--' }}</td>
                    <td>{{ $day['clock_out'] ?? '--:--' }}</td>
                    <td>{{ $day['hours'] > 0 ? $day['hours'] . 'h' : '' }}</td>
                    <td style="font-size: 10px; color: #666;">
                        @if($day['absence'])
                            <strong>JUSTIFICADO:</strong> {{ $day['absence'] }}
                        @endif
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="total-section">
        <p>Horas Reales Trabajadas: <strong>{{ $total_worked }}h</strong></p>
        <p>Horas Justificadas (Ausencias): <strong>{{ $total_justified }}h</strong></p>
        <p style="font-size: 16px; color: #4f46e5;">Total Cómputo: <strong>{{ $grand_total }}h</strong></p>
    </div>

    <table class="signatures" style="margin-top: 100px;">
        <tr>
            <td style="border: none;">Firma del Becario</td>
            <td style="border: none; width: 34%;">Firma Tutor Empresa</td>
            <td style="border: none;">Sello Centro Educativo</td>
        </tr>
    </table>
</body>

</html>