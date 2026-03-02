<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Media Test</title>
</head>
<body>
    <h1>Subir archivo</h1>

    <form action="/media-test" method="POST" enctype="multipart/form-data">
        @csrf
        <input type="file" name="file">
        <button type="submit">Subir</button>
    </form>
</body>
</html>