<?php

namespace App\Controllers;

use App\Models\User;

class AuthController
{
    private $userModel;

    public function __construct()
    {
        $this->userModel = new User();
    }

    public function register($request)
    {
        $data = json_decode($request, true);
        
        if (!isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
            return $this->jsonResponse(['error' => '缺少必要字段'], 400);
        }

        $existingUser = $this->userModel->findByEmail($data['email']);
        if ($existingUser) {
            return $this->jsonResponse(['error' => '邮箱已被注册'], 400);
        }

        if (strlen($data['password']) < 6) {
            return $this->jsonResponse(['error' => '密码至少需要6个字符'], 400);
        }

        $success = $this->userModel->create($data['name'], $data['email'], $data['password']);
        
        if ($success) {
            $user = $this->userModel->findByEmail($data['email']);
            unset($user['password']);
            return $this->jsonResponse([
                'message' => '注册成功',
                'user' => $user
            ], 201);
        }

        return $this->jsonResponse(['error' => '注册失败'], 500);
    }

    public function login($request)
    {
        $data = json_decode($request, true);
        
        if (!isset($data['email']) || !isset($data['password'])) {
            return $this->jsonResponse(['error' => '缺少邮箱或密码'], 400);
        }

        $user = $this->userModel->findByEmail($data['email']);
        
        if (!$user || !$this->userModel->verifyPassword($data['password'], $user['password'])) {
            return $this->jsonResponse(['error' => '邮箱或密码错误'], 401);
        }

        unset($user['password']);
        
        // 在实际应用中，这里应该生成JWT token
        // 为了简化，我们返回用户信息
        return $this->jsonResponse([
            'message' => '登录成功',
            'user' => $user
        ]);
    }

    private function jsonResponse($data, $statusCode = 200)
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        return json_encode($data, JSON_UNESCAPED_UNICODE);
    }
}