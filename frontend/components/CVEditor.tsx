import { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  Button,
  useToast,
  HStack,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import dynamic from 'next/dynamic'
import axios from 'axios'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

interface CVEditorProps {
  cvData: any
  onContentUpdate: (content: string) => void
  onAnalysisUpdate: (analysis: any) => void
}

export default function CVEditor({
  cvData,
  onContentUpdate,
  onAnalysisUpdate,
}: CVEditorProps) {
  const [content, setContent] = useState(cvData.editedContent || cvData.content)
  const [saving, setSaving] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const toast = useToast()

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    setContent(cvData.editedContent || cvData.content)
  }, [cvData])

  const handleSave = async () => {
    setSaving(true)
    try {
      await axios.put(`${API_URL}/cv/${cvData.id}`, {
        editedContent: content,
      })

      onContentUpdate(content)

      toast({
        title: 'Saved',
        description: 'Your changes have been saved',
        status: 'success',
        duration: 2000,
      })
    } catch (error: any) {
      toast({
        title: 'Save failed',
        description: error.response?.data?.error || error.message,
        status: 'error',
        duration: 3000,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    try {
      const response = await axios.post(`${API_URL}/cv/${cvData.id}/analyze`)
      onAnalysisUpdate(response.data.atsAnalysis)

      toast({
        title: 'Analysis complete',
        description: 'Your CV has been re-analyzed',
        status: 'success',
        duration: 2000,
      })
    } catch (error: any) {
      toast({
        title: 'Analysis failed',
        description: error.response?.data?.error || error.message,
        status: 'error',
        duration: 3000,
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const handleDownload = (format: 'text' | 'html') => {
    const url = `${API_URL}/download/${cvData.id}/${format}`
    window.open(url, '_blank')
  }

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link'],
      ['clean'],
    ],
  }

  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between" mb={4}>
        <Text fontSize="lg" fontWeight="semibold">
          Edit your CV content
        </Text>
        <HStack>
          <Button
            colorScheme="blue"
            onClick={handleAnalyze}
            isLoading={analyzing}
            loadingText="Analyzing..."
          >
            Re-analyze
          </Button>
          <Button
            colorScheme="brand"
            onClick={handleSave}
            isLoading={saving}
            loadingText="Saving..."
          >
            Save Changes
          </Button>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              Download
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => handleDownload('text')}>
                Download as Text
              </MenuItem>
              <MenuItem onClick={() => handleDownload('html')}>
                Download as HTML
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </HStack>

      <Box bg="white" borderRadius="md" p={4} borderWidth="1px">
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          modules={quillModules}
          style={{ minHeight: '500px' }}
        />
      </Box>

      <Box mt={4}>
        <Text fontSize="sm" color="gray.600">
          <strong>Tip:</strong> Make sure to include relevant keywords, proper
          headings, and avoid complex formatting for better ATS compatibility.
        </Text>
      </Box>
    </VStack>
  )
}

