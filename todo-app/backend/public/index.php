<?php

require_once __DIR__ . '/../../vendor/autoload.php';

use App\Controllers\AuthController;
use App\Controllers\TodoController;

// 设置CORS头
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// 处理预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 获取请求方法和路径
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/index.php', '', $path);

// 简单路由
switch ($path) {
    case '/api/register':
        if ($method === 'POST') {
            $auth = new AuthController();
            $input = file_get_contents('php://input');
            echo $auth->register($input);
        } else {
            http_response_code(405);
            echo json_encode(['error' => '方法不允许']);
        }
        break;

    case '/api/login':
        if ($method === 'POST') {
            $auth = new AuthController();
            $input = file_get_contents('php://input');
            echo $auth->login($input);
        } else {
            http_response_code(405);
            echo json_encode(['error' => '方法不允许']);
        }
        break;

    case '/api/todos':
        if ($method === 'GET') {
            // 简化：这里应该从JWT token获取用户ID
            // 为了演示，我们使用查询参数或默认用户ID
            $userId = $_GET['user_id'] ?? 1;
            $status = $_GET['status'] ?? 'all';
            
            $todo = new TodoController();
            echo $todo->index($userId, $status);
        } elseif ($method === 'POST') {
            $userId = $_GET['user_id'] ?? 1;
            $input = file_get_contents('php://input');
            
            $todo = new TodoController();
            echo $todo->store($userId, $input);
        } else {
            http_response_code(405);
            echo json_encode(['error' => '方法不允许']);
        }
        break;

    case (preg_match('/^\/api\/todos\/(\d+)$/', $path, $matches) ? true : false):
        $todoId = $matches[1];
        $userId = $_GET['user_id'] ?? 1;
        $input = file_get_contents('php://input');
        
        $todo = new TodoController();
        
        switch ($method) {
            case 'GET':
                echo $todo->show($userId, $todoId);
                break;
            case 'PUT':
                echo $todo->update($userId, $todoId, $input);
                break;
            case 'DELETE':
                echo $todo->destroy($userId, $todoId);
                break;
            default:
                http_response_code(405);
                echo json_encode(['error' => '方法不允许']);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => '路由不存在']);
        break;
}