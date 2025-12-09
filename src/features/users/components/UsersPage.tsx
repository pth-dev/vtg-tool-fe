import { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Add, Delete } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material'

import { PageHeader } from '@/shared/components/ui'
import { useConfirm } from '@/shared/stores'
import { createUserSchema, type CreateUserFormData } from '@/shared/validation'
import { useUsers } from '../hooks/useUsers'

export default function UsersPage() {
  const { users, createUser, deleteUser, isCreating, createError, resetCreateError } = useUsers()
  const confirm = useConfirm()
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      password: '',
      full_name: '',
    },
  })

  const onSubmit = (data: CreateUserFormData) => {
    createUser(data, {
      onSuccess: () => {
        setOpen(false)
        reset()
      },
    })
  }

  const handleClose = () => {
    setOpen(false)
    reset()
    resetCreateError()
  }

  const handleDelete = (user: { id: number; email: string; full_name: string }) => {
    confirm({
      title: 'Delete User',
      message: `Are you sure you want to delete user "${user.full_name || user.email}"? This action cannot be undone.`,
      confirmText: 'Delete',
      confirmColor: 'error',
      onConfirm: () => deleteUser(user.id),
    })
  }

  return (
    <Box p={3}>
      <PageHeader
        title="User Management"
        action={
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
            Add User
          </Button>
        }
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
            {users.map((u: { id: number; email: string; full_name: string }) => (
              <TableRow key={u.id}>
                <TableCell>{u.id}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.full_name}</TableCell>
                <TableCell align="right">
                  <IconButton color="error" onClick={() => handleDelete(u)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>Add New Admin</DialogTitle>
          <DialogContent>
            {createError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {createError}
              </Alert>
            )}
            <TextField
              {...register('email')}
              fullWidth
              label="Email"
              margin="normal"
              error={!!errors.email}
              helperText={errors.email?.message}
              autoFocus
            />
            <TextField
              {...register('password')}
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <TextField
              {...register('full_name')}
              fullWidth
              label="Full Name"
              margin="normal"
              error={!!errors.full_name}
              helperText={errors.full_name?.message}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
