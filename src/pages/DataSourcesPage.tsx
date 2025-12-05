import { useState, useRef, useMemo } from 'react'
import { Box, Card, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Chip, Dialog, DialogTitle, DialogContent, Button } from '@mui/material'
import { Upload, Delete, Visibility, InsertDriveFile } from '@mui/icons-material'
import { PageHeader, DataTable } from '../components/ui'
import { useDataSources } from '../hooks'

export default function DataSourcesPage() {
  const { sources, isLoading, uploadFile, deleteSource, isUploading, previewData } = useDataSources()
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<{ columns: string[]; data: any[] } | null>(null)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadFile(file)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handlePreview = async (id: number) => setPreview(await previewData(id))

  return (
    <Box p={3}>
      <PageHeader 
        title="Data Management"
        action={
          <Button variant="contained" startIcon={<Upload />} component="label">
            Upload File
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.json" onChange={handleUpload} hidden />
          </Button>
        }
      />

      {isUploading && <Box color="primary.main" mb={2}>Uploading...</Box>}

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>File Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Rows</TableCell>
              <TableCell>Columns</TableCell>
              <TableCell>Status</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} align="center">Loading...</TableCell></TableRow>
            ) : sources.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No data available</TableCell></TableRow>
            ) : (
              sources.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell><Box display="flex" alignItems="center" gap={1}><InsertDriveFile color="success" />{s.name}</Box></TableCell>
                  <TableCell><Chip label={s.file_type} size="small" /></TableCell>
                  <TableCell>{s.row_count?.toLocaleString()}</TableCell>
                  <TableCell>{s.column_count}</TableCell>
                  <TableCell><Chip label={s.status} color={s.status === 'ready' ? 'success' : 'warning'} size="small" /></TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handlePreview(s.id)}><Visibility /></IconButton>
                    <IconButton size="small" color="error" onClick={() => deleteSource(s.id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!preview} onClose={() => setPreview(null)} maxWidth="lg" fullWidth>
        <DialogTitle>Data Preview</DialogTitle>
        <DialogContent>
          {preview && <PreviewDataTable columns={preview.columns} data={preview.data} />}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

function PreviewDataTable({ columns, data }: { columns: string[]; data: any[] }) {
  const tableColumns = useMemo(() => 
    columns.map(col => ({
      accessorKey: col,
      header: col,
      cell: (info: any) => String(info.getValue() ?? '')
    })), [columns])

  return <DataTable data={data} columns={tableColumns} />
}
