import { useState, useEffect, useCallback } from 'react';
import { arrayMove } from '@dnd-kit/sortable';

const TASKS_STORAGE_KEY = 'tasks';

export function useTasks() {
  const [tasks, setTasks] = useState(() => {
    const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
    return storedTasks ? JSON.parse(storedTasks) : [];
  });

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = useCallback((text) => {
    if (text.trim() === '') return;
    const newTask = {
      id: Date.now(),
      text,
      completed: false,
      dueDate: null,
      priority: 'Medium',
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  }, []);

  const toggleTaskComplete = useCallback((id) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }, []);

  const updateTask = useCallback((id, updatedData) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, ...updatedData } : task
      )
    );
  }, []);

  const reorderTasks = useCallback((activeId, overId) => {
    if (activeId !== overId) {
      setTasks(items => {
        const oldIndex = items.findIndex(item => item.id === activeId);
        const newIndex = items.findIndex(item => item.id === overId);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  return {
    tasks,
    addTask,
    deleteTask,
    toggleTaskComplete,
    updateTask,
    reorderTasks,
  };
}
