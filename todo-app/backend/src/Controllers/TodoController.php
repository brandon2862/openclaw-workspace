<?php

namespace App\Controllers;

use App\Models\Todo;

class TodoController
{
    private $todoModel;

    public function __construct()
    {
        $this->todoModel = new Todo();
    }

    public function index($userId, $status = 'all')
    {
        $todos = $this->todoModel->getByUserAndStatus($userId, $status);
        return $this->jsonResponse(['todos' => $todos]);
    }

    public function show($userId, $id)
    {
        $todo = $this->todoModel->find($id, $userId);
        
        if (!$todo) {
            return $this->jsonResponse(['error' => '待办事项不存在'], 404);
        }

        return $this->jsonResponse(['todo' => $todo]);
    }

    public function store($userId, $request)
    {
        $data = json_decode($request, true);
        
        if (!isset($data['title']) || empty(trim($data['title']))) {
            return $this->jsonResponse(['error' => '标题不能为空'], 400);
        }

        $description = isset($data['description']) ? $data['description'] : null;
        $success = $this->todoModel->create($userId, trim($data['title']), $description);
        
        if ($success) {
            return $this->jsonResponse(['message' => '创建成功'], 201);
        }

        return $this->jsonResponse(['error' => '创建失败'], 500);
    }

    public function update($userId, $id, $request)
    {
        $todo = $this->todoModel->find($id, $userId);
        
        if (!$todo) {
            return $this->jsonResponse(['error' => '待办事项不存在'], 404);
        }

        $data = json_decode($request, true);
        $updateData = [];

        if (isset($data['title']) && !empty(trim($data['title']))) {
            $updateData['title'] = trim($data['title']);
        }

        if (isset($data['description'])) {
            $updateData['description'] = $data['description'];
        }

        if (isset($data['completed']) && is_bool($data['completed'])) {
            $updateData['completed'] = $data['completed'];
        }

        if (empty($updateData)) {
            return $this->jsonResponse(['error' => '没有要更新的字段'], 400);
        }

        $success = $this->todoModel->update($id, $userId, $updateData);
        
        if ($success) {
            return $this->jsonResponse(['message' => '更新成功']);
        }

        return $this->jsonResponse(['error' => '更新失败'], 500);
    }

    public function destroy($userId, $id)
    {
        $todo = $this->todoModel->find($id, $userId);
        
        if (!$todo) {
            return $this->jsonResponse(['error' => '待办事项不存在'], 404);
        }

        $success = $this->todoModel->delete($id, $userId);
        
        if ($success) {
            return $this->jsonResponse(['message' => '删除成功']);
        }

        return $this->jsonResponse(['error' => '删除失败'], 500);
    }

    private function jsonResponse($data, $statusCode = 200)
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        return json_encode($data, JSON_UNESCAPED_UNICODE);
    }
}