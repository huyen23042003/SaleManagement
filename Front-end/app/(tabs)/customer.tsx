import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface Customer {
    customerID: string;
    customerName: string;
    phone: string;
}

const API_URL = "http://10.0.2.2:5046/api/Customer";

export default function CustomerScreen() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isEdit, setIsEdit] = useState(false);

    const fetchCustomers = async () => {
        try {
            const response = await axios.get(API_URL);
            setCustomers(response.data);
        } catch (error: any) {
            console.error("Lỗi:", error.message);
        }
    };

    useEffect(() => { fetchCustomers(); }, []);

    const handlePhoneChange = (text: string) => {
        const cleanNumber = text.replace(/[^0-9]/g, '');
        setPhone(cleanNumber);
    };

    const handleSave = async (shouldClose: boolean = true) => {
        if (!id || !name || !phone) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
            return;
        }
        if (phone.length < 9 || phone.length > 11) {
            Alert.alert("Lỗi", "Vui lòng nhập số điện thoại tối thiểu 9 số và tối đa là 11 số");
            return;
        }
        const customerData = {
            customerID: id.trim().toUpperCase(),
            customerName: name,
            phone: phone
        };

        try {
            if (isEdit) {
                await axios.put(`${API_URL}/${id}`, customerData);
            } else {
                await axios.post(API_URL, customerData);
            }

            resetForm();
            fetchCustomers();

            if (shouldClose) {
                setModalVisible(false);
                Alert.alert("Thành công", "Đã lưu thông tin khách hàng!");
            } else {
                Alert.alert("Thành công", "Đã lưu thông tin khách hàng");
            }
        } catch (error: any) {
            Alert.alert("Thông báo", error.response?.data || "Có lỗi xảy ra");
        }
    };
    const handleIdChange = (text: string) => {
        const formattedId = text.toUpperCase().replace(/\s+/g, '');
        setId(formattedId);
    };
    const handleDelete = (id: string) => {
        Alert.alert("Xác nhận", "Xóa khách hàng này khỏi danh sách?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa", style: "destructive", onPress: async () => {
                    try {
                        await axios.delete(`${API_URL}/${id}`);
                        fetchCustomers();
                    } catch (error: any) {
                        Alert.alert("Lỗi", "Khách hàng này đã tồn tại trong hóa đơn, không thể xóa");
                    }
                }
            }
        ]);
    };

    const resetForm = () => {
        setId(''); setName(''); setPhone(''); setIsEdit(false);
    };

    const renderItem = ({ item }: { item: Customer }) => (
        <View style={styles.itemCard}>
            <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => {
                    setSelectedCustomer(item);
                    setDetailModalVisible(true);
                }}
            >
                <Text style={styles.itemTitle}>{item.customerName}</Text>
                <Text style={styles.itemSubText}>ID: {item.customerID}</Text>
                <Text style={styles.itemPhoneText}>📞 {item.phone}</Text>
            </TouchableOpacity>

            <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.btnEdit} onPress={() => {
                    setId(item.customerID); setName(item.customerName);
                    setPhone(item.phone); setIsEdit(true); setModalVisible(true);
                }}>
                    <Text style={styles.btnEditText}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnDelete} onPress={() => handleDelete(item.customerID)}>
                    <Text style={styles.btnDeleteText}>Xóa</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <Text style={styles.header}>DANH MỤC KHÁCH HÀNG</Text>

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => { resetForm(); setModalVisible(true); }}
            >
                <Text style={styles.addButtonText}>+ Thêm khách hàng</Text>
            </TouchableOpacity>

            <FlatList
                data={customers}
                keyExtractor={(item) => item.customerID}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            />

            {/* Modal Thêm/Sửa */}
            <Modal visible={modalVisible} animationType="fade" transparent={true}>
                <View style={styles.centeredView}>
                    <View style={styles.modalForm}>
                        <Text style={styles.modalTitle}>{isEdit ? "CẬP NHẬT" : "THÊM MỚI"}</Text>

                        <Text style={styles.label}>Mã khách hàng</Text>
                        <TextInput
                            style={[styles.input, isEdit && styles.inputDisabled]}
                            value={id}
                            onChangeText={handleIdChange}
                            editable={!isEdit}
                            placeholder="Ví dụ: KH001"
                        />

                        <Text style={styles.label}>Tên khách hàng</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Nhập họ và tên"
                        />

                        <Text style={styles.label}>Số điện thoại</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={phone}
                            onChangeText={handlePhoneChange}
                            placeholder="Ví dụ: 090xxxxxxx"
                        />

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.btnSave} onPress={() => handleSave(true)}>
                                <Text style={styles.btnSaveText}>Lưu</Text>
                            </TouchableOpacity>

                            {!isEdit && (
                                <TouchableOpacity style={styles.btnNext} onPress={() => handleSave(false)}>
                                    <Text style={styles.btnNextText}>Nhập tiếp</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity style={styles.btnClose} onPress={() => setModalVisible(false)}>
                                <Text style={styles.btnCloseText}>Hủy</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal Xem chi tiết */}
            <Modal visible={detailModalVisible} animationType="fade" transparent={true}>
                <View style={styles.centeredView}>
                    <View style={styles.detailCard}>
                        <View style={styles.detailHeader}>
                            <Text style={styles.detailTitle}>Chi tiết khách hàng</Text>
                        </View>
                        <View style={styles.detailBody}>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Mã khách hàng:</Text>
                                <Text style={styles.detailValue}>{selectedCustomer?.customerID}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Họ và tên:</Text>
                                <Text style={styles.detailValue}>{selectedCustomer?.customerName}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Số điện thoại:</Text>
                                <Text style={[styles.detailValue, { color: '#0984e3', fontWeight: 'bold' }]}>{selectedCustomer?.phone}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.btnDetailClose} onPress={() => setDetailModalVisible(false)}>
                            <Text style={styles.btnDetailCloseText}>Đóng cửa sổ</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#F0F2F5' },
    header: { fontSize: 22, fontWeight: '800', color: '#2D3436', textAlign: 'center', marginVertical: 15, marginTop: 25, marginBottom: 10 },

    // Card item
    itemCard: {
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 15,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    itemTitle: { fontSize: 18, fontWeight: '700', color: '#2D3436' },
    itemSubText: { fontSize: 13, color: '#636E72', marginTop: 2 },
    itemPhoneText: { fontSize: 15, color: '#0984E3', fontWeight: '600', marginTop: 5 },

    actionButtons: { flexDirection: 'column', gap: 8 },
    btnEdit: { backgroundColor: '#f5f8dd', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
    btnEditText: { color: '#aa9d0d', fontWeight: '700', fontSize: 13 },
    btnDelete: { backgroundColor: '#FFEBEE', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
    btnDeleteText: { color: '#D32F2F', fontWeight: '700', fontSize: 13 },

    addButton: { backgroundColor: '#10b83f', padding: 16, borderRadius: 12, marginBottom: 15, alignItems: 'center' },
    addButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

    // Modal Styles
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalForm: { width: '90%', backgroundColor: '#FFF', borderRadius: 20, padding: 25 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#2D3436', marginBottom: 20, textAlign: 'center' },
    label: { fontSize: 14, fontWeight: '700', color: '#636E72', marginBottom: 5 },
    input: { backgroundColor: '#F8F9FA', padding: 12, borderRadius: 10, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#E9ECEF' },
    inputDisabled: { backgroundColor: '#E9ECEF', color: '#6C757D' },

    modalFooter: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
    btnSave: { flex: 1, backgroundColor: '#007AFF', padding: 14, borderRadius: 10, alignItems: 'center' },
    btnSaveText: { color: '#FFF', fontWeight: '700' },
    btnNext: { flex: 1, backgroundColor: '#28A745', padding: 14, borderRadius: 10, alignItems: 'center' },
    btnNextText: { color: '#FFF', fontWeight: '700' },
    btnClose: { flex: 1, backgroundColor: '#ADB5BD', padding: 14, borderRadius: 10, alignItems: 'center' },
    btnCloseText: { color: '#FFF', fontWeight: '700' },

    // Detail Card
    detailCard: { width: '85%', backgroundColor: '#FFF', borderRadius: 25, overflow: 'hidden', elevation: 10 },
    detailHeader: { backgroundColor: '#c9ab18', padding: 20, alignItems: 'center' },
    detailTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
    detailBody: { padding: 20 },
    detailItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F3F5' },
    detailLabel: { color: '#636E72', fontWeight: '600' },
    detailValue: { color: '#2D3436', fontSize: 16 },
    btnDetailClose: { margin: 20, marginTop: 0, padding: 15, backgroundColor: '#F8F9FA', borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E9ECEF' },
    btnDetailCloseText: { fontWeight: '700', color: '#2D3436' }
});