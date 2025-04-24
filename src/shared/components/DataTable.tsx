import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Typography,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';

export interface Column<T> {
  id: keyof T;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any) => string | number | React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  pagination?: {
    total: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rowsPerPage: number) => void;
  };
  onSort?: (columnId: keyof T, direction: 'asc' | 'desc') => void;
  actions?: (row: T) => React.ReactNode;
  bgColor?: string;
  borderColor?: string;
}

function DataTable<T extends { [key: string]: any }>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data found',
  pagination,
  onSort,
  actions,
  bgColor = '#65d9c8',
  borderColor = '#65d9c8',
}: DataTableProps<T>) {
  const theme = useTheme();
  const [orderBy, setOrderBy] = useState<keyof T | null>(null);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (columnId: keyof T) => {
    const isAsc = orderBy === columnId && order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    setOrder(newOrder);
    setOrderBy(columnId);
    onSort?.(columnId, newOrder);
  };

  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        mt: 2,
        borderRadius: 2,
        border: `1px solid ${alpha(borderColor, 0.2)}`,
        boxShadow: theme.shadows[2],
        '& .MuiTableHead-root': {
          bgcolor: alpha(bgColor, 0.1),
          '& .MuiTableCell-root': {
            borderBottom: `2px solid ${alpha(borderColor, 0.2)}`,
            color: theme.palette.text.primary,
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          },
          '& .MuiTableSortLabel-root': {
            color: theme.palette.text.primary,
            '&:hover': {
              color: theme.palette.primary.main,
            },
            '&.Mui-active': {
              color: theme.palette.primary.main,
              '& .MuiTableSortLabel-icon': {
                color: theme.palette.primary.main,
              },
            },
          },
        },
        '& .MuiTableBody-root': {
          '& .MuiTableRow-root': {
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              transform: 'translateY(-1px)',
              boxShadow: theme.shadows[1],
            },
          },
          '& .MuiTableCell-root': {
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            fontSize: '0.875rem',
            color: theme.palette.text.secondary,
          },
        },
        '& .MuiTablePagination-root': {
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          '& .MuiTablePagination-select': {
            color: theme.palette.text.secondary,
          },
          '& .MuiTablePagination-selectIcon': {
            color: theme.palette.text.secondary,
          },
          '& .MuiTablePagination-displayedRows': {
            color: theme.palette.text.secondary,
          },
        },
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={String(column.id)}
                align={column.align || 'left'}
                style={{ minWidth: column.minWidth }}
              >
                {column.sortable ? (
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={orderBy === column.id ? order : 'asc'}
                    onClick={() => handleSort(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                ) : (
                  column.label
                )}
              </TableCell>
            ))}
            {actions && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length + (actions ? 1 : 0)} align="center" sx={{ py: 3 }}>
                <CircularProgress size={24} />
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (actions ? 1 : 0)} align="center" sx={{ py: 3 }}>
                <Typography color="text.secondary">{emptyMessage}</Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => {
                  const value = row[column.id];
                  return (
                    <TableCell key={String(column.id)} align={column.align || 'left'}>
                      {column.format ? column.format(value) : value}
                    </TableCell>
                  );
                })}
                {actions && (
                  <TableCell align="right">
                    {actions(row)}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {pagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={pagination.total}
          rowsPerPage={pagination.rowsPerPage}
          page={pagination.page}
          onPageChange={(_, page) => pagination.onPageChange(page)}
          onRowsPerPageChange={(e) => pagination.onRowsPerPageChange(parseInt(e.target.value, 10))}
        />
      )}
    </TableContainer>
  );
}

export default DataTable; 