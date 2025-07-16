import React, { useState, useMemo } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Container, Row, Col, Form, Button, ListGroup } from 'react-bootstrap';
import { useTasks } from './useTasks';
import { SortableItem } from './SortableItem';
import './App.css';

function App() {
  const {
    tasks,
    addTask,
    deleteTask,
    toggleTaskComplete,
    updateTask,
    reorderTasks,
  } = useTasks();

  const [newTask, setNewTask] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddTask = (e) => {
    e.preventDefault();
    addTask(newTask);
    setNewTask('');
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over) {
      reorderTasks(active.id, over.id);
    }
  };

  const filteredTasks = useMemo(() => 
    tasks.filter(task =>
      task.text.toLowerCase().includes(searchQuery.toLowerCase())
    ), [tasks, searchQuery]);

  return (
    <div className="App">
      <Container>
        <Row className="justify-content-md-center">
          <Col md="8">
            <h1 className="my-4 text-center">Todo App</h1>
            <Form onSubmit={handleAddTask} className="mb-3">
              <Row>
                <Col>
                  <Form.Control
                    type="text"
                    placeholder="Enter a new task"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                  />
                </Col>
                <Col xs="auto">
                  <Button type="submit" variant="primary">Add Task</Button>
                </Col>
              </Row>
            </Form>
            <Form.Control
              type="text"
              placeholder="Search tasks..."
              className="mb-3"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filteredTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <ListGroup>
                  {filteredTasks.map(task => (
                    <SortableItem
                      key={task.id}
                      id={task.id}
                      task={task}
                      onToggleComplete={toggleTaskComplete}
                      onDelete={deleteTask}
                      onUpdate={updateTask}
                    />
                  ))}
                </ListGroup>
              </SortableContext>
            </DndContext>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
