<?php
header("Content-Type: application/json");

// Database configuration
$dbHost = "localhost";
$dbName = "db_hts";
$dbUser = "root";
$dbPassword = "";

// Create a MySQLi connection
$mysqli = new mysqli($dbHost, $dbUser, $dbPassword, $dbName);

// Check connection
if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

// Get Menu Items
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $result = $mysqli->query("SELECT * FROM menu");
    $menuItems = [];

    while ($row = $result->fetch_assoc()) {
        $menuItems[] = $row;
    }

    echo json_encode($menuItems);
}

// Add new Menu Item
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    if (isset($data["nama_makanan"]) && isset($data["nama_minuman"])) {
        $namaMakanan = $data["nama_makanan"];
        $namaMinuman = $data["nama_minuman"];
        $mysqli->query("INSERT INTO menu (nama_makanan, nama_minuman) VALUES ('$namaMakanan', '$namaMinuman')");
        echo json_encode(["message" => "Menu item added successfully"]);
    } else {
        echo json_encode(["error" => "Food name and drink name are required"]);
    }
}

// Update Menu Item status
if ($_SERVER["REQUEST_METHOD"] === "PUT") {
    parse_str(file_get_contents("php://input"), $data);
    $id = $data["id"];
    $completed = $data["completed"];

    $mysqli->query("UPDATE menu SET completed = $completed WHERE id = $id");
    echo json_encode(["message" => "Menu item status updated successfully"]);
}

// Delete Menu Item
if ($_SERVER["REQUEST_METHOD"] === "DELETE") {
    parse_str(file_get_contents("php://input"), $data);
    $id = $data["id"];

    $mysqli->query("DELETE FROM menu WHERE id = $id");
    echo json_encode(["message" => "Menu item deleted successfully"]);
}

// Close the MySQLi connection
$mysqli->close();
?>