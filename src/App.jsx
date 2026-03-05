import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Paper,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
  CssBaseline,
} from '@mui/material'
import SirionLogo from './assets/sirion_logo.svg'

const theme = createTheme({
  palette: {
    primary: {
      main: '#0d5e68',
    },
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    fontSize: 12,
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontSize: '0.75rem',
          borderRadius: 6,
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#0d5e68',
            borderWidth: 1,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#d1d9e6',
          },
        },
        input: {
          fontSize: '0.75rem',
          padding: '8px 12px',
          color: '#334155',
          '&::placeholder': {
            fontSize: '0.75rem',
          },
        },
        notchedOutline: {
          borderColor: '#e2e8f0',
        },
      },
    },
  },
})

function App() {
  const [prDetails, setPrDetails] = useState({
    pr_id: '',
    item: '',
    model: '',
    quantity: '',
    brand: '',
    specifications: '',
    category: '',
    services: '',
    function: '',
    status: '',
  })

  const parentTargetOrigin = useRef('*')
  const hasSentApprovalMessage = useRef(false)

  useEffect(() => {
    function handleMessage(event) {
      if (event.data?.type === 'ui_component_render') {
        parentTargetOrigin.current = event.origin || '*'

        const payload = event.data?.payload
        if (payload) {
          setPrDetails({
            pr_id: payload.pr_id || '',
            item: payload.item || '',
            model: payload.model || '',
            quantity: payload.quantity || '',
            brand: payload.brand || '',
            specifications: payload.specifications || '',
            category: payload.category || '',
            services: payload.services || '',
            function: payload.function || '',
            status: payload.status || '',
          })
          // Reset the flag when new data is received
          hasSentApprovalMessage.current = false
        }
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  useEffect(() => {
    const isApproved = prDetails.status.toLowerCase() === 'pr approved'
    if (isApproved && prDetails.pr_id && !hasSentApprovalMessage.current) {
      sendMessageToGrandparent(prDetails.pr_id, prDetails.status)
      hasSentApprovalMessage.current = true
    }
  }, [prDetails.status, prDetails.pr_id])

  const prFields = [
    { label: 'PR ID', key: 'pr_id' },
    { label: 'Item', key: 'item' },
    { label: 'Model', key: 'model' },
    { label: 'Quantity', key: 'quantity' },
    { label: 'Preferred Brands', key: 'brand' },
    { label: 'Additional Specifications', key: 'specifications' },
    { label: 'Purchase Category', key: 'category' },
    { label: 'Services', key: 'services' },
    { label: 'Function', key: 'function' },
    { label: 'Status', key: 'status' },
  ]

  const isApproved = prDetails.status.toLowerCase() === 'pr approved'

  const sendMessageToGrandparent = (prId, status) => {
    console.log('Sending PR metadata to grandparent:', { prId, status })
    try {
      const targetWindow = window.parent?.parent?.parent
      if (!targetWindow || targetWindow === window) return
      targetWindow.postMessage(
        {
          type: 'ui_component_call_message',
          message: 'PR Updated',
          llmMessage: JSON.stringify({ pr_id: prId, status }),
          data: { pr_id: prId, status },
        },
        '*'
      )
      console.log('Message with PR metadata sent to grandparent successfully')
    } catch (error) {
      console.error('Error sending message to grandparent:', error)
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: '#f5f7fa',
          p: 2,
          gap: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3.5 },
            width: '100%',
            maxWidth: 500,
            borderRadius: 3,
            border: '1px solid #e8ecf1',
          }}
        >
          <Box sx={{ mb: 1.5 }}>
            <img src={SirionLogo} alt="Sirion Logo" style={{ height: 32, width: 'auto' }} />
          </Box>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '0.9rem',
              color: '#1e293b',
              mb: 2,
              letterSpacing: '-0.01em',
            }}
          >
            Purchase Requisition Details
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {prFields.map((field) => (
              <Box
                key={field.key}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    color: '#475569',
                    minWidth: 160,
                    flexShrink: 0,
                    textAlign: 'left',
                  }}
                >
                  {field.label}
                </Typography>
                <TextField
                  value={prDetails[field.key]}
                  size="small"
                  InputProps={{ readOnly: true }}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#f8fafc',
                    },
                    ...(field.key === 'status' && {
                      '& .MuiOutlinedInput-input': {
                        fontWeight: 600,
                        color: isApproved ? '#0d5e68' : '#92400e',
                      },
                    }),
                  }}
                />
              </Box>
            ))}
          </Box>
        </Paper>
        <Box
          sx={{
            width: '100%',
            maxWidth: 500,
            bgcolor: isApproved ? '#3d8a93' : '#e5a336',
            color: '#fff',
            borderRadius: 2.5,
            px: 2.5,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            boxShadow: isApproved
              ? '0 2px 8px rgba(61,138,147,0.25)'
              : '0 2px 8px rgba(229,163,54,0.25)',
          }}
        >
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '0.7rem',
              fontWeight: 700,
            }}
          >
            {isApproved ? '✓' : '!'}
          </Box>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#fff', lineHeight: 1.5 }}>
            {isApproved
              ? 'Now that the PR has been Approved, would you like to initiate the RFQ process now?'
              : 'The PR is pending approval, check again after some time.'}
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
