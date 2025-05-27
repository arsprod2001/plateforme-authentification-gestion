import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { TrashIcon, PencilIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'

interface User {
  id: number
  name: string
  email: string
  role: string
}

export default function Dashboard() {
  const { logout } = useAuth()
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 3, name: 'Alex Johnson', email: 'alex@example.com', role: 'Manager' },
  ])

  const handleDelete = (id: number) => {
    setUsers(users.filter(user => user.id !== id))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500/10 to-transparent mix-blend-screen" />
      <div className="absolute w-96 h-96 bg-cyan-500/5 rounded-full -top-48 -left-48 blur-3xl animate-pulse" />
      <div className="absolute w-96 h-96 bg-purple-500/5 rounded-full -bottom-48 -right-48 blur-3xl animate-pulse delay-1000" />

      {/* Navigation */}
      <nav className="bg-gray-800/80 backdrop-blur-lg border-b border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center space-x-2">
              <UserCircleIcon className="h-8 w-8 text-cyan-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Admin Panel
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg hover:shadow-cyan-500/20"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-cyan-500/30 flex justify-between items-center bg-gradient-to-r from-cyan-900/30 to-purple-900/30">
            <div>
              <h3 className="text-2xl font-semibold text-cyan-100">Gestion des utilisateurs</h3>
              <p className="text-sm text-cyan-300 mt-1">{users.length} utilisateurs trouvés</p>
            </div>
            <Link
              to="#"
              className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-gray-900 px-6 py-3 rounded-xl hover:shadow-cyan-500/20 transition-shadow font-bold"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Nouvel utilisateur</span>
            </Link>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-cyan-500/20">
              <thead className="bg-cyan-900/10">
                <tr>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-cyan-300 uppercase">Nom</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-cyan-300 uppercase">Email</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-cyan-300 uppercase">Rôle</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-cyan-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/20 bg-gray-800/50">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-8 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-full w-full rounded-full bg-cyan-900/30 flex items-center justify-center">
                            <span className="text-cyan-400 font-medium">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-cyan-100">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-sm text-cyan-300">{user.email}</td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.role === 'Admin' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : user.role === 'Manager' 
                            ? 'bg-cyan-500/20 text-cyan-400' 
                            : 'bg-green-500/20 text-green-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <div className="flex space-x-4">
                        <button className="text-cyan-500/80 hover:text-cyan-400 transition-colors p-2 rounded-lg hover:bg-cyan-500/10">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-purple-500/80 hover:text-purple-400 transition-colors p-2 rounded-lg hover:bg-purple-500/10"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-8 py-6 border-t border-cyan-500/30 flex justify-between items-center bg-gray-800/50">
            <div className="text-sm text-cyan-300">
              Page 1 sur 1
            </div>
            <div className="flex space-x-2">
              <button className="px-4 py-2 text-cyan-300 bg-cyan-900/30 rounded-lg hover:bg-cyan-900/50">
                Précédent
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-gray-900 font-bold rounded-lg hover:opacity-90">
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PlusIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}