import { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'

import { Alert, Box, Button, Card, CardContent, TextField, Typography } from '@mui/material'

import { useAuthStore } from '@/features/auth'
import { api, ApiError } from '@/services/api'
import { loginSchema, type LoginFormData } from '@/shared/validation'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    setError('')
    try {
      await api.login(data.email, data.password)
      // Cookie is set automatically by backend
      const user = await api.me()
      setAuth(user)
      navigate({ to: '/' })
    } catch (err) {
      if (err instanceof ApiError) {
        // Map backend errors to user-friendly messages
        if (err.message === 'Invalid credentials') {
          setError('Incorrect email or password')
        } else {
          setError(err.message)
        }
      } else {
        setError('Incorrect email or password')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      display="flex"
      minHeight="100vh"
      alignItems="center"
      justifyContent="center"
      bgcolor="background.default"
    >
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" fontWeight={700} color="primary" mb={1}>
              VTGTOOL
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Admin Login
            </Typography>
          </Box>
          <form onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              fullWidth
              label="Email"
              type="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              margin="normal"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <Box textAlign="center" mt={3}>
            <Typography
              component={Link}
              to="/"
              variant="body2"
              color="text.secondary"
              sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
            >
              Back to Dashboard
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
