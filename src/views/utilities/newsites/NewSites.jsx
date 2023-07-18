import React, { useState, useEffect } from 'react';
import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Modal, Form, Input } from 'antd';
import MainCard from 'ui-component/cards/MainCard';
import { Grid } from '@mui/material';
import { gridSpacing } from 'store/constant';
import { DataGrid } from '@mui/x-data-grid';
import { Tooltip } from '@material-ui/core';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Popconfirm } from 'antd';
import axiosNew from '../../../api/axiosNew';
import './newsite.scss';

const NewSite = () => {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [ip, setIp] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    if (!name || !id || !ip) {
      toast.error('Please fill in all fields.');
      return;
    }

    handleSubmit();
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // FUNGSI UNTUK UPDATE DATA SETELAH ACTION

  function getApi() {
    const accessToken = localStorage.getItem('access_token');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `${accessToken}`
    };
    const fetchAllUsers = async () => {
      try {
        // console.log(token);

        const res = await axiosNew.get('/site', {
          headers
        });
        setUsers(res.data.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchAllUsers();
  }

  // INI API UNTUK CREATE NEW SITE

  const handleSubmit = async () => {
    const postData = { name: name, id: id, public_ip: ip };
    try {
      const response = await axiosNew.post('/site', postData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      //   console.log(response.status);

      if (response.status === 200) {
        setName('');
        setId('');
        setIp('');
        toast.success('Registered Successfully.');
        getApi();
      } else if (response.status === 409) {
        toast.error('User already exists.');
      } else {
        setError('Failed to register, please try again.');
      }
    } catch (error) {
      console.error(error);
      setError('Failed to register, please try again.');
    }
  };

  const columnSites = [
    {
      field: 'no',
      headerName: 'No',
      width: 70
    },
    { field: 'id', headerName: 'ID', flex: 1 },
    { field: 'name', headerName: 'Site Name', flex: 3 },
    { field: 'public_ip', headerName: 'IP Public', flex: 1 }

    // ini contoh kalo pengen dapetin value dari 2 row di jadikan satu
    // {
    //   field: 'fullName',
    //   headerName: 'Full name',
    //   description: 'This column has a value getter and is not sortable.',
    //   sortable: false,
    //   width: 160,
    //   valueGetter: (params) => `${params.row.name || ''} ${params.row.lastName || ''}`
    // }
  ];

  // API DELETE DATA SITE

  const deleteAccount = async (id) => {
    try {
      const token = localStorage.getItem('access_token');

      const res = await axiosNew.delete('/site', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        data: {
          id: `${id}`
        }
      });

      //   console.log('deleted clicked');
      if (res.status === 200) {
        toast.success('Deleted Successfuly.');
        getApi();
      } else {
        toast.error('Failed to delete user, please try again.');
      }
    } catch (err) {
      console.log(err);
    }
  };

  // API GET DATA SITE

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosNew.get('/site', {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // console.log(response.data);
        setUsers(response.data.data);
        // isMounted && setUsers(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const actionColumn = [
    {
      field: 'action',
      headerName: 'Action',
      width: 150,
      renderCell: (rowData) => {
        return (
          <>
            <div className="cellAction">
              <Tooltip title="Edit" arrow>
                <div className="viewButtonOperator">
                  <DriveFileRenameOutlineIcon
                    className="viewIcon"
                    // onClick={() => handleShowEdit(rowData.id)}
                  />
                </div>
              </Tooltip>
              <Tooltip title="Delete" arrow>
                <div>
                  <Popconfirm
                    className="cellAction"
                    title="Delete Site"
                    description="Are you sure to delete this site?"
                    onConfirm={() => deleteAccount(rowData.id)}
                    icon={
                      <QuestionCircleOutlined
                        style={{
                          color: 'red'
                        }}
                      />
                    }
                  >
                    <div className="deleteButtonOperator">
                      <DeleteForeverOutlinedIcon />
                    </div>
                  </Popconfirm>
                </div>
              </Tooltip>
            </div>
          </>
        );
      }
    }
  ];

  // INI UNTUK PEMBUATAN NOMOR URUT SECARA OTOMATIS
  const addIndex = (array) => {
    return array.map((item, index) => {
      item.no = index + 1;
      return item;
    });
  };

  // Layout Form Input

  const layout = {
    labelCol: {
      span: 5,
      style: {
        textAlign: 'left'
      }
    },
    wrapperCol: {
      span: 18
    }
  };

  const validateMessages = {
    required: '${label} is required!',
    types: {
      email: '${label} is not a valid email!'
    }
  };

  const validateIPv4 = (rule, value, callback) => {
    const ipPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;

    if (!ipPattern.test(value)) {
      callback('Invalid IPv4 address!');
    } else {
      callback();
    }
  };

  return (
    <MainCard title="Jakwifi Sites">
      <ToastContainer />
      <Modal title="Input New Site" centered onOk={handleOk} onCancel={handleCancel} open={isModalOpen}>
        <Form
          {...layout}
          name="nest-messages"
          style={{
            maxWidth: 600,
            marginTop: 25
          }}
          validateMessages={validateMessages}
        >
          <Form.Item
            name={['user', 'id']}
            label="ID Site"
            rules={[
              {
                required: true
              }
            ]}
          >
            <Input value={id} onChange={(e) => setId(e.target.value)} />
          </Form.Item>
          <Form.Item
            name={['user', 'name']}
            label="Name Site"
            rules={[
              {
                required: true
              }
            ]}
          >
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Form.Item>
          <Form.Item
            name={['user', 'ip']}
            label="IP Public"
            rules={[
              {
                required: true,
                validator: validateIPv4
              }
            ]}
          >
            <Input style={{ width: '50%' }} value={ip} onChange={(e) => setIp(e.target.value)} />
          </Form.Item>
        </Form>
      </Modal>

      <Grid container spacing={gridSpacing}>
        <Grid item xs={12} className="gridButton">
          <Button type="primary" icon={<PlusCircleOutlined />} onClick={showModal}>
            Add New
          </Button>
        </Grid>
        <Grid item xs={12}>
          <DataGrid
            columns={columnSites.concat(actionColumn)}
            rows={addIndex(users)}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 }
              }
            }}
            pageSizeOptions={[5, 10, 50, 100]}
          />
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default NewSite;
