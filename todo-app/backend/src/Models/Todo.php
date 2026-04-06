<?php

namespace App\Models;

use App\Config\Database;

class Todo
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getAllByUser($userId)
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC"
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function getByUserAndStatus($userId, $status)
    {
        $query = "SELECT * FROM todos WHERE user_id = ?";
        
        if ($status === 'active') {
            $query .= " AND completed = FALSE";
        } elseif ($status === 'completed') {
            $query .= " AND completed = TRUE";
        }
        
        $query .= " ORDER BY created_at DESC";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function find($id, $userId)
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM todos WHERE id = ? AND user_id = ?"
        );
        $stmt->execute([$id, $userId]);
        return $stmt->fetch();
    }

    public function create($userId, $title, $description = null)
    {
        $stmt = $this->db->prepare(
            "INSERT INTO todos (user_id, title, description) VALUES (?, ?, ?)"
        );
        return $stmt->execute([$userId, $title, $description]);
    }

    public function update($id, $userId, $data)
    {
        $fields = [];
        $values = [];
        
        foreach ($data as $key => $value) {
            if (in_array($key, ['title', 'description', 'completed'])) {
                $fields[] = "$key = ?";
                $values[] = $value;
            }
        }
        
        if (empty($fields)) {
            return false;
        }
        
        $values[] = $id;
        $values[] = $userId;
        
        $sql = "UPDATE todos SET " . implode(', ', $fields) . " WHERE id = ? AND user_id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($values);
    }

    public function delete($id, $userId)
    {
        $stmt = $this->db->prepare(
            "DELETE FROM todos WHERE id = ? AND user_id = ?"
        );
        return $stmt->execute([$id, $userId]);
    }
}