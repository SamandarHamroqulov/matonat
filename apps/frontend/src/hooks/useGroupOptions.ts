import { useEffect, useState } from 'react'
import { getGroups, type GroupSummary } from '../api/groups'

export const useGroupOptions = () => {
  const [groups, setGroups] = useState<GroupSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsLoading(true)
        const response = await getGroups({
          page: 1,
          limit: 100,
          isActive: true,
        })
        setGroups(response.data)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchGroups()
  }, [])

  return { groups, isLoading }
}
