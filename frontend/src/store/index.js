import { configureStore, combineReducers } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from './storage'
import authReducer from './slices/authSlice'
import tasksReducer from './slices/tasksSlice'
import filtersReducer from './slices/filtersSlice'
import { setupApiInterceptors } from '../services/api'

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token'],
}

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  tasks: tasksReducer,
  filters: filtersReducer,
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

setupApiInterceptors(store)
