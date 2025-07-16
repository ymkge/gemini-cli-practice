import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ListGroup, Button, Form, Badge } from 'react-bootstrap';
import { GripVertical } from 'react-bootstrap-icons';
import { EditTaskModal } from './EditTaskModal';

export function SortableItem({ id, task, onToggleComplete, onDelete, onUpdate }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const [isEditing, setIsEditing] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = (updatedData) => {
    onUpdate(task.id, updatedData);
    setIsEditing(false);
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return <Badge bg="danger">High</Badge>;
      case 'Medium':
        return <Badge bg="warning">Medium</Badge>;
      case 'Low':
        return <Badge bg="success">Low</Badge>;
      default:
        return <Badge bg="secondary">{priority}</Badge>;
    }
  };

  return (
    <>
      <ListGroup.Item
        ref={setNodeRef}
        style={style}
        className={`d-flex align-items-center ${task.completed ? 'completed' : ''} priority-${task.priority}`}
      >
        <div {...attributes} {...listeners} style={{ cursor: 'grab', touchAction: 'none' }} className="me-2">
          <GripVertical />
        </div>
        <div style={{ flexGrow: 1 }}>
          <Form.Check
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggleComplete(id)}
            label={<span className={task.completed ? 'text-muted' : ''}>{task.text}</span>}
          />
          {task.dueDate && (
            <div className="due-date mt-1">Due: {task.dueDate}</div>
          )}
        </div>
        <div className="d-flex align-items-center">
          {getPriorityBadge(task.priority)}
          <Button variant="info" size="sm" className="ms-3 me-2" onClick={() => setIsEditing(true)}>Edit</Button>
          <Button variant="danger" size="sm" onClick={() => onDelete(id)}>Delete</Button>
        </div>
      </ListGroup.Item>

      <EditTaskModal 
        task={task} 
        show={isEditing} 
        onHide={() => setIsEditing(false)} 
        onSave={handleSave} 
      />
    </>
  );
}
