import { useState } from 'react'
import {
  Box,
  Button,
  VStack,
  Text,
  useToast,
  Progress,
  Center,
} from '@chakra-ui/react'
import axios from 'axios'

interface FileUploaderProps {
  onUploadSuccess: (data: any) => void
}

export default function FileUploader({ onUploadSuccess }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const toast = useToast()

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const fileType = file.name.split('.').pop()?.toLowerCase()
    if (fileType !== 'pdf' && fileType !== 'docx') {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF or DOCX file',
        status: 'error',
        duration: 3000,
      })
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'File size must be less than 10MB',
        status: 'error',
        duration: 3000,
      })
      return
    }

    setUploading(true)
    setProgress(0)

    const formData = new FormData()
    formData.append('cv', file)

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            setProgress(percentCompleted)
          }
        },
      })

      toast({
        title: 'Upload successful',
        description: 'Your CV has been uploaded and analyzed',
        status: 'success',
        duration: 3000,
      })

      onUploadSuccess(response.data)
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.response?.data?.error || error.message,
        status: 'error',
        duration: 5000,
      })
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <Box
      borderWidth="2px"
      borderStyle="dashed"
      borderColor="gray.300"
      borderRadius="lg"
      p={8}
      bg="white"
    >
      <VStack spacing={4}>
        <Center>
          <Box
            as="svg"
            boxSize={12}
            color="gray.400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </Box>
        </Center>
        <VStack spacing={2}>
          <Text fontSize="lg" fontWeight="semibold">
            Upload your CV
          </Text>
          <Text fontSize="sm" color="gray.600" textAlign="center">
            Supported formats: PDF, DOCX (Max size: 10MB)
          </Text>
        </VStack>

        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="file-upload"
          disabled={uploading}
        />
        <label htmlFor="file-upload">
          <Button
            as="span"
            colorScheme="brand"
            isLoading={uploading}
            loadingText="Uploading..."
            cursor="pointer"
          >
            Choose File
          </Button>
        </label>

        {uploading && (
          <Box w="100%" mt={4}>
            <Progress value={progress} colorScheme="brand" size="sm" />
            <Text fontSize="sm" color="gray.600" mt={2} textAlign="center">
              {progress}% uploaded
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  )
}

