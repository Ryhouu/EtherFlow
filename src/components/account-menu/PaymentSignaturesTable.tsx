import * as React from 'react';
import { useState, useEffect } from "react";
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import { visuallyHidden } from '@mui/utils';
import { PaymentSignatureLogDataSchema } from '../schema/PaymentSignatureDataSchema';
import { AccountDataSchema } from '../schema/AccountDataSchema';
import { fetchWithToast } from '../../utils/toast';
import CopyableTableCell from './CopyableTableCell';
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack, TextField } from '@mui/material';
import { ChannelStatus } from '../schema/PaymentChannelDataSchema';
import ShareIcon from '@mui/icons-material/Share';
import { useSession } from 'next-auth/react';

interface Data {
  id: number;
  contractAddress: string;
  signer: string;
  amount: number;
  signature: string;
  expiration: Date;
  status: ChannelStatus;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'contractAddress',
    numeric: false,
    disablePadding: true,
    label: 'Contract Address',
  },
  {
    id: 'signer',
    numeric: true,
    disablePadding: false,
    label: 'Signer',
  },
  {
    id: 'amount',
    numeric: true,
    disablePadding: false,
    label: 'Amount (ETH)',
  },
  {
    id: 'signature',
    numeric: true,
    disablePadding: false,
    label: 'Signature',
  },
  {
    id: 'expiration',
    numeric: true,
    disablePadding: false,
    label: 'Expiration Date',
  },
  {
    id: 'status',
    numeric: false,
    disablePadding: false,
    label: 'Status',
  },
];

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
    props;
  const createSortHandler =
    (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all desserts',
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

interface EnhancedTableToolbarProps {
  numSelected: number;
  main: string;
  setOpenShareFormDialog: (value:boolean) => void
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const { numSelected, main, setOpenShareFormDialog } = props;
  

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          { main }
        </Typography>
      )}
      {numSelected > 0 ? (
        <Stack direction="row" spacing={2}>
          <Tooltip title="Share">
            <IconButton onClick={() => {setOpenShareFormDialog(true)}}>
              <ShareIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
              <IconButton>
                <DeleteIcon />
              </IconButton>
          </Tooltip>
        </Stack>
        
      ) : (
        <Tooltip title="Filter list">
          <IconButton>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}

interface ResponseBody {
    message: string,
    paymentSignatureData: PaymentSignatureLogDataSchema[]
}

export default function PaymentSignaturesTable({
    accountData,
    open
}: {
    accountData: Partial<AccountDataSchema>,
    open: boolean
}) {
    const [paymentSignatureData, setPaymentSignatureData] = React.useState<PaymentSignatureLogDataSchema[]>([])
    const handleFetch = async () => {
        const res = await fetchWithToast(`/api/log/payment-signatures?account=${accountData.account}`, {
            method: 'GET',
        })
        const bodyJson: ResponseBody = await res.json()
        if (res.ok) {
            setPaymentSignatureData(bodyJson.paymentSignatureData)
        }
    } 
    useEffect(() => {
        if (open) {
            handleFetch()
        }
    }, [open]); 
    
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof Data>('expiration'); //TODO: created at?
  const [selected, setSelected] = React.useState<readonly number[]>([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Data,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = paymentSignatureData.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDense(event.target.checked);
  };

  const isSelected = (id: number) => selected.indexOf(id) !== -1;

  const [emptyRows, setEmptyRows] = useState<number>(0)

  // Avoid a layout jump when reaching the last page with empty rows.


    useEffect(() => {
        console.log("Updated paymentSignatureData:", paymentSignatureData);
        setEmptyRows(page > 0 ? Math.max(0, (1 + page) * rowsPerPage - paymentSignatureData.length) : 0);
    }, [paymentSignatureData]); 

    const preprocessedRows = React.useMemo(() => paymentSignatureData.map(data => ({
        ...data,
        // Ensure data.expiration is a Date object before calling getTime()
        // expiration: data.expiration instanceof Date ? data.expiration.getTime() : data.expiration,
        expiration: (new Date(data.expiration)).toLocaleString()
    })), [paymentSignatureData]);

    const visibleRows = React.useMemo(() => 
        stableSort(preprocessedRows, getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [preprocessedRows, order, orderBy, page, rowsPerPage]
    );

    const { data: session, status } = useSession();
    const [emailDetails, setEmailDetails] = useState({
        to: '',
        subject: "Claim Your Payment",
        body: ''
    });

    useEffect(() => {
      const selectedSignatureData = paymentSignatureData.filter(n => selected.includes(n.id));
      setEmailDetails(value => ({
        ...value,
        body: "Here are your payment details: \n\n" + selectedSignatureData.map(value => 
          `Contract Address: ${value.contractAddress} \nSignature: ${value.signature} \nSender Address: ${value.signer} \nExpiration: ${value.expiration}\n`
        ).join('\n')
      }))
    }, [selected])


    console.log("[Sending] Session:", session);
    console.log("[Sending] Session status:", status);

    const [openShareFormDialog, setOpenShareFormDialog] = React.useState(false);

    const handleShare = async() => {
      if (!session) {
          alert("Please sign in with Google at My Account first.")
          return;
      }
  
      const res = await fetchWithToast('/api/gmail/SendEmailMessage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'same-origin',
          body: JSON.stringify(emailDetails)
      });

      const data = await res.json();
      if (res.ok) {
          console.log(data)
          alert('Email sent successfully!');
          setOpenShareFormDialog(false)
      } else {
          alert('Failed to send email.');
      }
  }
     

    

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar numSelected={selected.length} main={"Signatures"} setOpenShareFormDialog={setOpenShareFormDialog} />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={paymentSignatureData.length}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const isItemSelected = isSelected(row.id);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    // onClick={(event) => handleClick(event, row.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        onClick={(event) => handleClick(event, row.id)}
                        inputProps={{
                          'aria-labelledby': labelId,
                        }}
                      />
                    </TableCell>
                    
                    <CopyableTableCell 
                        content={row.contractAddress} 
                        id={labelId}
                        scope="row"
                        padding="none"
                    />
                    <CopyableTableCell content={row.signer} align="left"/>
                    <TableCell align="right">{row.amount}</TableCell>
                    <CopyableTableCell content={row.signature} align="left"/>
                    <TableCell align="right">{row.expiration}</TableCell>
                    <TableCell align="right">
                        {
                            (row.status === ChannelStatus.Open) && 
                            <Chip label={row.status} color="success" variant="outlined" />
                        }
                        {
                            (row.status === ChannelStatus.Closed) && 
                            <Chip label={row.status} />
                        }
                        {
                            (row.status === ChannelStatus.Timeout) && 
                            <Chip label={row.status} color="warning" variant="outlined" />
                        }
                        
                    </TableCell>
                    {/* <CopyableTableCell content={row.signer} align="left"/> */}
                    
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: (dense ? 33 : 53) * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={paymentSignatureData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Dense padding"
      />

      <Dialog
                            open={openShareFormDialog}
                            onClose={() => {setOpenShareFormDialog(false)}}
                            PaperProps={{
                            component: 'form',
                            onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                                event.preventDefault();
                                const formData = new FormData(event.currentTarget);
                                const formJson = Object.fromEntries((formData as any).entries());
                                const email = formJson.email;
                                console.log(email);
                                setOpenShareFormDialog(false)
                            },
                            }}
                        >
                            <DialogTitle>Share</DialogTitle>
                            <DialogContent>
                            <DialogContentText>
                                To share to this signed signature, please enter the recipient email address here and grant us access to help you send an email. 
                            </DialogContentText>
                            {/* <TextField
                                autoFocus
                                required
                                margin="dense"
                                id="name"
                                name="email"
                                label="Your Email Address"
                                type="email"
                                fullWidth
                                variant="standard"
                            /> */}
                            <TextField
                                autoFocus
                                required
                                margin="dense"
                                id="name"
                                name="email"
                                label="Recipient Email Address"
                                type="email"
                                fullWidth
                                variant="standard"
                                onChange={(e) => {
                                    setEmailDetails(value => ({ ...value, to: e.target.value}))
                                }}
                            />
                            </DialogContent>
                            <DialogActions>
                            <Button onClick={() => {setOpenShareFormDialog(false)}}>Cancel</Button>
                            <Button onClick={handleShare}>Share</Button>
                            </DialogActions>
                        </Dialog>
    </Box>
  );
}