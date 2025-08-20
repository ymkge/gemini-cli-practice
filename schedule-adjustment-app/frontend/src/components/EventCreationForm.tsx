import React, { useState } from 'react';
import { TextField, Button, Box, Typography, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import axios from 'axios';
import { Event, CandidateDate } from '../types/event';

const EventCreationForm: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [candidateDates, setCandidateDates] = useState<CandidateDate[]>([{ date: '', time: '' }]);

  const handleAddCandidateDate = () => {
    setCandidateDates([...candidateDates, { date: '', time: '' }]);
  };

  const handleRemoveCandidateDate = (index: number) => {
    const newCandidateDates = candidateDates.filter((_, i) => i !== index);
    setCandidateDates(newCandidateDates);
  };

  const handleCandidateDateChange = (index: number, field: keyof CandidateDate, value: string) => {
    const newCandidateDates = candidateDates.map((cd, i) =>
      i === index ? { ...cd, [field]: value } : cd
    );
    setCandidateDates(newCandidateDates);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newEvent: Event = {
        title,
        description,
        candidateDates: candidateDates.filter(cd => cd.date && cd.time),
      };
      const response = await axios.post('/api/events', newEvent);
      console.log('Event created:', response.data);
      alert('Event created successfully!');
      // Optionally, clear form or redirect
      setTitle('');
      setDescription('');
      setCandidateDates([{ date: '', time: '' }]);
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', p: 3, border: '1px solid #ccc', borderRadius: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Create New Event
      </Typography>
      <TextField
        label="Event Title"
        fullWidth
        margin="normal"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <TextField
        label="Description (Optional)"
        fullWidth
        margin="normal"
        multiline
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <Typography variant="h6" component="h3" sx={{ mt: 3, mb: 1 }}>
        Candidate Dates
      </Typography>
      {candidateDates.map((cd, index) => (
        <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
          <TextField
            label="Date"
            type="date"
            value={cd.date}
            onChange={(e) => handleCandidateDateChange(index, 'date', e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            required
          />
          <TextField
            label="Time"
            type="time"
            value={cd.time}
            onChange={(e) => handleCandidateDateChange(index, 'time', e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            required
          />
          {candidateDates.length > 1 && (
            <IconButton onClick={() => handleRemoveCandidateDate(index)} color="error">
              <RemoveIcon />
            </IconButton>
          )}
        </Box>
      ))}
      <Button
        startIcon={<AddIcon />}
        onClick={handleAddCandidateDate}
        variant="outlined"
        sx={{ mb: 3 }}
      >
        Add Candidate Date
      </Button>

      <Button type="submit" variant="contained" color="primary" fullWidth>
        Create Event
      </Button>
    </Box>
  );
};

export default EventCreationForm;
