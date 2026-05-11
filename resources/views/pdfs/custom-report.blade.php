<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; color: #1f2937; font-size: 11px; }
        h1 { margin: 0 0 4px; font-size: 22px; color: #0f766e; }
        .meta { margin-bottom: 18px; color: #64748b; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #0f766e; color: white; text-align: left; padding: 8px; font-size: 10px; }
        td { border-bottom: 1px solid #e5e7eb; padding: 7px 8px; vertical-align: top; }
        tr:nth-child(even) td { background: #f8fafc; }
    </style>
</head>
<body>
    <h1>{{ $title }}</h1>
    <div class="meta">Generado el {{ $generatedAt }} · {{ $rows->count() }} registros</div>

    <table>
        <thead>
            <tr>
                @foreach ($columns as $column)
                    <th>{{ $availableColumns[$column]['heading'] }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @forelse ($rows as $row)
                <tr>
                    @foreach ($columns as $column)
                        <td>{{ data_get($row, $column, '—') }}</td>
                    @endforeach
                </tr>
            @empty
                <tr>
                    <td colspan="{{ count($columns) }}">No hay datos para los filtros seleccionados.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
