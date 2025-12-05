import { useState } from 'react'
import { Box, Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton, TextField, Button } from '@mui/material'
import { Add, Delete } from '@mui/icons-material'
import { PageHeader, FormDialog } from '../components/ui'
import { useUsers } from '../hooks'

export default function UsersPage() {
  const { users, createUser, deleteUser, isCreating, createError } = useUsers()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', full_name: '' })

  const handleSubmit = () => {
    createUser(form, {
      onSuccess: () => { setOpen(false); setForm({ email: '', password: '', full_name: '' }) }
    })
  }

  return (
    <Box p={3}>
      <PageHeader 
        title="User Management"
        action={<Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Add User</Button>}
      />

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Name</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u: any) => (
              <TableRow key={u.id}>
                <TableCell>{u.id}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.full_name}</TableCell>
                <TableCell align="right">
                  <IconButton color="error" onClick={() => deleteUser(u.id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <FormDialog open={open} onClose={() => setOpen(false)} title="Add New Admin" onSubmit={handleSubmit} submitLabel="Create" loading={isCreating} error={createError}>
        <TextField fullWidth label="Email" margin="normal" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <TextField fullWidth label="Password" type="password" margin="normal" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <TextField fullWidth label="Full Name" margin="normal" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
      </FormDialog>
    </Box>
  )
}
