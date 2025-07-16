import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

export function EditTaskModal({ task, show, onHide, onSave }) {
  const [editedText, setEditedText] = useState('');
  const [editedDueDate, setEditedDueDate] = useState('');
  const [editedPriority, setEditedPriority] = useState('Medium');

  useEffect(() => {
    if (task) {
      setEditedText(task.text);
      setEditedDueDate(task.dueDate || '');
      setEditedPriority(task.priority || 'Medium');
    }
  }, [task]);

  const handleSave = () => {
    onSave({ 
      text: editedText, 
      dueDate: editedDueDate, 
      priority: editedPriority 
    });
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Task</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Task</Form.Label>
          <Form.Control
            type="text"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Due Date</Form.Label>
          <Form.Control
            type="date"
            value={editedDueDate}
            onChange={(e) => setEditedDueDate(e.target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Priority</Form.Label>
          <Form.Select
            value={editedPriority}
            onChange={(e) => setEditedPriority(e.target.value)}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </Form.Select>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
