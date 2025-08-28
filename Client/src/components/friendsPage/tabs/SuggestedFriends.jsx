import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { toast } from "react-toastify";
import UserCard from "../UserCard";
import SearchBar from "../SearchBar";

export default function SuggestedFriends() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchSuggestions = async (pageNum = 1) => {
    if (!hasMore && pageNum !== 1) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/friends/friend-suggestions?page=${pageNum}&limit=20`
      );
      const { users: fetched, hasMore: more } = res.data;

      if (pageNum === 1) {
        setUsers(fetched);
        setFilteredUsers(fetched);
      } else {
        setUsers((prev) => [...prev, ...fetched]);
        setFilteredUsers((prev) => [...prev, ...fetched]);
      }
      setHasMore(more);
    } catch (err) {
      console.error("Fetch suggestions error:", err);
      toast.error("Failed to load suggestions");
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (friendId) => {
    try {
      await axiosInstance.post(`/friends/request/${friendId}`, null);
      // mark locally
      setUsers((prev) =>
        prev.map((u) => (u._id === friendId ? { ...u, requestSent: true } : u))
      );
      setFilteredUsers((prev) =>
        prev.map((u) => (u._id === friendId ? { ...u, requestSent: true } : u))
      );
      toast.success("Friend request sent!");
    } catch (err) {
      console.error(err);
      toast.error("Error sending friend request!");
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const filtered = users.filter(user => {
      const fullName = `${user.FirstName} ${user.LastName || ''}`.toLowerCase();
      
      // Search by name
      if (fullName.includes(term.toLowerCase())) {
        return true;
      }
      
      // Search by skills
      if (user.OtherDetails?.skills && 
          user.OtherDetails.skills.toLowerCase().includes(term.toLowerCase())) {
        return true;
      }
      
      // Search by interests
      if (user.OtherDetails?.interests && 
          user.OtherDetails.interests.toLowerCase().includes(term.toLowerCase())) {
        return true;
      }
      
      return false;
    });
    
    setFilteredUsers(filtered);
  };
  
  useEffect(() => {
    fetchSuggestions(1);
  }, []);
  
  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop + 100 >=
      document.documentElement.scrollHeight
    ) {
      if (!loading && hasMore) {
        setPage((prev) => {
          const next = prev + 1;
          fetchSuggestions(next);
          return next;
        });
      }
    }
  }, [loading, hasMore]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (loading)
    return <div className="text-center text-gray-500">Loading...</div>;

  if (!users.length)
    return <div className="text-center text-gray-500">No suggestions</div>;

  return (
    <div>
      {users.length > 0 && (
        <SearchBar 
          onSearch={handleSearch} 
          placeholder="Search by name, skills, or interests..."
        />
      )}
      
      <div className="flex flex-wrap gap-3 2xl:gap-4 mt-4">
        {filteredUsers.map((user) => (
          <UserCard
            key={user._id}
            user={user}
            selectedTab="suggested"
            onSendRequest={sendRequest}
          />
        ))}
      </div>
      
      {filteredUsers.length === 0 && searchTerm && (
        <div className="text-center text-gray-500 mt-4">
          No matching friends found
        </div>
      )}
    </div>
  );
}
