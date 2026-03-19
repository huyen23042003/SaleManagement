import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
    Alert, FlatList, Modal,
    ScrollView,
    StatusBar,
    StyleSheet, Text,
    TextInput, TouchableOpacity, View
} from 'react-native';

const API_URL = "https://shaquita-benzal-isaura.ngrok-free.dev/api";
interface InvoiceDetail {
    productID: string;
    productName?: string;
    quantity: number;
    price: number;
    totalPrice: number;
}

interface Invoice {
    invoiceID: string;
    customerID: string;
    customerName?: string; 
    invoiceDate: string;
    invoiceDetails: InvoiceDetail[];
    totalPrice: number;
}

export default function InvoiceScreen() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    const [modalVisible, setModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    const [invoiceID, setInvoiceID] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [details, setDetails] = useState<InvoiceDetail[]>([]);
    const [currentProduct, setCurrentProduct] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [customerSearch, setCustomerSearch] = useState('');
    const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [resInv, resCust, resProd] = await Promise.all([
                axios.get(`${API_URL}/Invoice`),
                axios.get(`${API_URL}/Customer`),
                axios.get(`${API_URL}/Product`)
            ]);
            setInvoices(resInv.data);
            setCustomers(resCust.data);
            setProducts(resProd.data);
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        }
    };

    const handleInvoiceIdChange = (text: string) => {
        setInvoiceID(text.toUpperCase().replace(/\s+/g, ''));
    };

    const addDetailRow = () => {
        const prod = products.find(p => p.productID === currentProduct);
        if (!prod || parseInt(quantity) <= 0) {
            Alert.alert("Lỗi", "Vui lòng chọn sản phẩm và số lượng > 0");
            return;
        }

        const qtyToAdd = parseInt(quantity);
        const existingIndex = details.findIndex(d => d.productID === prod.productID);

        if (existingIndex !== -1) {
            const updatedDetails = [...details];
            updatedDetails[existingIndex].quantity += qtyToAdd;
            updatedDetails[existingIndex].totalPrice = updatedDetails[existingIndex].quantity * updatedDetails[existingIndex].price;
            setDetails(updatedDetails);
        } else {
            const newDetail: InvoiceDetail = {
                productID: prod.productID,
                productName: prod.productName,
                quantity: qtyToAdd,
                price: prod.price,
                totalPrice: qtyToAdd * prod.price
            };
            setDetails([...details, newDetail]);
        }
        
        setQuantity('1');
        setCurrentProduct('');
    };

    const calculateTotal = () => details.reduce((sum, item) => sum + item.totalPrice, 0);

    const handleSaveInvoice = async (shouldClose: boolean = true) => {
        if (!invoiceID || !selectedCustomer || details.length === 0) {
            Alert.alert("Thông báo", "Vui lòng nhập Mã HD, chọn Khách hàng và thêm ít nhất 1 sản phẩm.");
            return;
        }

        const payload = {
            InvoiceID: invoiceID,
            CustomerID: selectedCustomer,
            InvoiceDate: new Date().toISOString(),
            TotalPrice: calculateTotal(),
            InvoiceDetails: details.map(d => ({
                ProductID: d.productID,
                Quantity: d.quantity,
                TotalPrice: d.totalPrice
            }))
        };

        try {
            if (isEdit) {
                await axios.put(`${API_URL}/Invoice/${invoiceID}`, payload);
                Alert.alert("Thành công", `Đã cập nhật hóa đơn ${invoiceID}`);
            } else {
                await axios.post(`${API_URL}/Invoice`, payload);
                Alert.alert("Thành công", `Đã lưu hóa đơn ${invoiceID} mới`);
            }

            fetchData();
            resetForm();

            if (shouldClose) {
                setModalVisible(false);
            }
        } catch (error: any) {
            console.error("Chi tiết lỗi Server:", error.response?.data);
            const errorMsg = error.response?.data
                ? JSON.stringify(error.response.data)
                : "Không thể kết nối đến máy chủ";
            Alert.alert("Lỗi lưu hóa đơn", errorMsg);
        }
    };

    const handleCustomerSearch = (text: string) => {
        setCustomerSearch(text);
        if (text.trim().length > 0) {
            const filtered = customers.filter(c =>
                c.customerID.toLowerCase().includes(text.toLowerCase()) ||
                c.customerName.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredCustomers(filtered);
        } else {
            setFilteredCustomers(customers);
        }
        setShowCustomerDropdown(true);
    };

    const selectCustomer = (customer: any) => {
        setSelectedCustomer(customer.customerID);
        setCustomerSearch(`${customer.customerID} - ${customer.customerName}`);
        setShowCustomerDropdown(false);
    };

    const handleEditPress = async (item: Invoice) => {
        try {
            const res = await axios.get(`${API_URL}/Invoice/${item.invoiceID}`);
            const fullData = res.data;
            const detailsWithNames = fullData.invoiceDetails.map((d: any) => {
                const p = products.find(prod => prod.productID === d.productID);
                return {
                    ...d,
                    productName: p?.productName || d.productID,
                    price: p?.price || (d.totalPrice / d.quantity)
                };
            });
            setInvoiceID(fullData.invoiceID);
            setSelectedCustomer(fullData.customerID);
            
            const cust = customers.find(c => c.customerID === fullData.customerID);
            setCustomerSearch(cust ? `${cust.customerID} - ${cust.customerName}` : fullData.customerID);
            
            setDetails(detailsWithNames);
            setIsEdit(true);
            setModalVisible(true);
        } catch (error) {
            Alert.alert("Lỗi", "Không thể lấy thông tin sửa");
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert("Xác nhận", `Xóa hóa đơn ${id}?`, [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa", style: "destructive", onPress: async () => {
                    try {
                        await axios.delete(`${API_URL}/Invoice/${id}`);
                        fetchData();
                    } catch (error) { Alert.alert("Lỗi", "Không thể xóa"); }
                }
            }
        ]);
    };

    const resetForm = () => {
        setInvoiceID(''); setSelectedCustomer(''); setCustomerSearch(''); setDetails([]); setIsEdit(false);
    };

    const openViewDetail = async (item: Invoice) => {
        try {
            const res = await axios.get(`${API_URL}/Invoice/${item.invoiceID}`);
            const data = res.data;
            
            const cust = customers.find(c => c.customerID === data.customerID);
            data.customerName = cust ? cust.customerName : "Không xác định";

            data.invoiceDetails = data.invoiceDetails.map((d: any) => {
                const p = products.find(prod => prod.productID === d.productID);
                return {
                    ...d,
                    productName: p?.productName || d.productID,
                    price: p?.price || (d.totalPrice / d.quantity)
                };
            });
            setSelectedInvoice(data);
            setViewModalVisible(true);
        } catch (error) {
            Alert.alert("Lỗi", "Không thể tải chi tiết");
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <Text style={styles.header}>DANH MỤC HÓA ĐƠN</Text>

            <TouchableOpacity style={styles.addButton} onPress={() => { resetForm(); setModalVisible(true); }}>
                <Text style={styles.addButtonText}>+ Lập hóa đơn mới</Text>
            </TouchableOpacity>

            <FlatList
                data={invoices}
                keyExtractor={(item) => item.invoiceID}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card} onPress={() => openViewDetail(item)}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.cardTitle}>Hóa đơn: {item.invoiceID}</Text>
                            <Text style={styles.cardSubText}>Mã khách hàng: {item.customerID}</Text>
                            <Text style={styles.cardTotal}>{item.totalPrice?.toLocaleString()} VNĐ</Text>
                        </View>
                        <View style={styles.cardActions}>
                            <TouchableOpacity onPress={() => handleEditPress(item)} style={styles.btnEdit}>
                                <Text style={styles.btnEditText}>Sửa</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(item.invoiceID)} style={styles.btnDelete}>
                                <Text style={styles.btnDeleteText}>Xóa</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                )}
            />

            {/* Modal Lập hóa đơn */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.fullModalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>
                            <Text style={styles.modalTitle}>{isEdit ? "CẬP NHẬT HÓA ĐƠN" : "LẬP HÓA ĐƠN"}</Text>

                            <Text style={styles.label}>Mã hóa đơn</Text>
                            <TextInput
                                style={[styles.input, isEdit && styles.inputDisabled]}
                                value={invoiceID}
                                onChangeText={handleInvoiceIdChange}
                                editable={!isEdit}
                            />

                            <Text style={styles.label}>Khách hàng</Text>
                            <View style={{ zIndex: 9999, position: 'relative' }}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Chọn hoặc nhập mã khách hàng..."
                                    value={customerSearch}
                                    onChangeText={handleCustomerSearch}
                                    onFocus={() => {
                                        if (customerSearch.trim().length === 0) setFilteredCustomers(customers);
                                        setShowCustomerDropdown(true);
                                    }}
                                />

                                {showCustomerDropdown && (
                                    <View style={styles.dropdownContainer}>
                                        <ScrollView
                                            style={{ maxHeight: 200 }}
                                            nestedScrollEnabled={true}
                                            keyboardShouldPersistTaps="handled"
                                        >
                                            {filteredCustomers.map((item) => (
                                                <TouchableOpacity
                                                    key={item.customerID}
                                                    style={styles.dropdownItem}
                                                    onPress={() => selectCustomer(item)}
                                                >
                                                    <Text style={styles.dropdownItemText}>
                                                        <Text style={{ fontWeight: 'bold' }}>{item.customerID}</Text> - {item.customerName}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>

                            <View style={styles.divider} />

                            <Text style={[styles.label, { color: '#0984e3' }]}>Thêm sản phẩm</Text>
                            <View style={styles.addItemBox}>
                                <View style={[styles.pickerWrapper, { flex: 2.2, marginBottom: 0 }]}>
                                    <Picker selectedValue={currentProduct} onValueChange={v => setCurrentProduct(v)}>
                                        <Picker.Item label="Sản phẩm..." value="" />
                                        {products.map(p => <Picker.Item key={p.productID} label={`${p.productName}`} value={p.productID} />)}
                                    </Picker>
                                </View>
                                <TextInput
                                    style={[styles.input, { flex: 0.6, marginBottom: 0, textAlign: 'center' }]}
                                    keyboardType="numeric"
                                    value={quantity}
                                    onChangeText={setQuantity}
                                />
                                <TouchableOpacity style={styles.smallAddBtn} onPress={addDetailRow}>
                                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20 }}>+</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.tableHeader}>
                                <Text style={{ flex: 1.5, fontWeight: '700', fontSize: 12 }}>Tên SP</Text>
                                <Text style={{ flex: 0.8, textAlign: 'right', fontWeight: '700', fontSize: 12 }}>Giá</Text>
                                <Text style={{ flex: 0.4, textAlign: 'center', fontWeight: '700', fontSize: 12 }}>SL</Text>
                                <Text style={{ flex: 1, textAlign: 'right', fontWeight: '700', fontSize: 12 }}>T.Tiền</Text>
                                <Text style={{ width: 25 }}></Text>
                            </View>

                            {details.map((item, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={{ flex: 1.5, fontSize: 12 }}>{item.productName}</Text>
                                    <Text style={{ flex: 0.8, textAlign: 'right', fontSize: 11 }}>{item.price.toLocaleString()}</Text>
                                    <Text style={{ flex: 0.4, textAlign: 'center', fontSize: 12 }}>{item.quantity}</Text>
                                    <Text style={{ flex: 1, textAlign: 'right', fontSize: 12, fontWeight: '600' }}>{item.totalPrice.toLocaleString()}</Text>
                                    <TouchableOpacity style={{ width: 25, alignItems: 'flex-end' }} onPress={() => setDetails(details.filter((_, i) => i !== index))}>
                                        <Text style={{ color: '#d63031', fontWeight: 'bold' }}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}

                            <Text style={styles.totalDisplay}>TỔNG CỘNG: {calculateTotal().toLocaleString()} VNĐ</Text>

                            <View style={styles.modalFooter}>
                                <TouchableOpacity style={styles.btnSubmit} onPress={() => handleSaveInvoice(true)}>
                                    <Text style={styles.btnSubmitText}>LƯU & ĐÓNG</Text>
                                </TouchableOpacity>

                                {!isEdit && (
                                    <TouchableOpacity style={[styles.btnSubmit, { backgroundColor: '#3498db' }]} onPress={() => handleSaveInvoice(false)}>
                                        <Text style={styles.btnSubmitText}>NHẬP TIẾP</Text>
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity style={styles.btnCancel} onPress={() => { setModalVisible(false); resetForm(); }}>
                                    <Text style={{ fontWeight: '700', color: '#636E72' }}>HỦY</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Modal Xem chi tiết - Đã sửa hiển thị tên khách */}
            <Modal visible={viewModalVisible} animationType="fade" transparent={true}>
                <View style={styles.fullModalOverlay}>
                    <View style={styles.viewDetailCard}>
                        <View style={styles.viewHeader}>
                            <Text style={styles.viewTitle}>CHI TIẾT HÓA ĐƠN</Text>
                            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 18, marginTop: 5 }}>{selectedInvoice?.invoiceID}</Text>
                        </View>
                        <View style={{ padding: 20 }}>
                            {/* HIỂN THỊ TÊN KHÁCH HÀNG TẠI ĐÂY */}
                            <Text style={styles.detailText}>Khách hàng: <Text style={{ fontWeight: 'bold', color: '#2D3436' }}>{selectedInvoice?.customerName}</Text></Text>
                            <Text style={styles.detailText}>Mã số: {selectedInvoice?.customerID}</Text>
                            <Text style={styles.detailText}>Ngày lập: {selectedInvoice ? new Date(selectedInvoice.invoiceDate).toLocaleDateString('vi-VN') : ''}</Text>
                            
                            <View style={[styles.tableHeader, { marginTop: 15 }]}>
                                <Text style={{ flex: 1.5, fontWeight: '700' }}>Sản phẩm</Text>
                                <Text style={{ flex: 0.8, textAlign: 'right', fontWeight: '700' }}>Giá</Text>
                                <Text style={{ flex: 0.4, textAlign: 'center', fontWeight: '700' }}>SL</Text>
                                <Text style={{ flex: 1, textAlign: 'right', fontWeight: '700' }}>T.Tiền</Text>
                            </View>
                            {selectedInvoice?.invoiceDetails.map((det, i) => (
                                <View key={i} style={styles.tableRow}>
                                    <Text style={{ flex: 1.5, fontSize: 13 }}>{det.productName}</Text>
                                    <Text style={{ flex: 0.8, textAlign: 'right', fontSize: 12 }}>{det.price.toLocaleString()}</Text>
                                    <Text style={{ flex: 0.4, textAlign: 'center', fontSize: 13 }}>{det.quantity}</Text>
                                    <Text style={{ flex: 1, textAlign: 'right', fontWeight: '700', fontSize: 13 }}>{det.totalPrice.toLocaleString()}</Text>
                                </View>
                            ))}
                            <View style={styles.viewFooter}>
                                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>TỔNG THANH TOÁN:</Text>
                                <Text style={{ fontWeight: '900', color: '#D63031', fontSize: 22 }}>{selectedInvoice?.totalPrice.toLocaleString()} VNĐ</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.btnCloseView} onPress={() => setViewModalVisible(false)}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>ĐÓNG</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 15, backgroundColor: '#F0F2F5' },
    header: { fontSize: 22, fontWeight: '900', textAlign: 'center', color: '#2D3436', marginVertical: 15, marginTop: 25, marginBottom: 10 },
    card: {
        backgroundColor: '#FFF', padding: 18, borderRadius: 20, marginBottom: 12,
        flexDirection: 'row', elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10
    },
    cardTitle: { fontSize: 17, fontWeight: '800', color: '#2D3436' },
    cardSubText: { color: '#636E72', marginTop: 3 },
    cardTotal: { color: '#10b83f', fontWeight: '800', marginTop: 8, fontSize: 16 },
    cardActions: { justifyContent: 'center', gap: 8 },
    btnEdit: { backgroundColor: '#f5f8dd', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
    btnEditText: { color: '#aa9d0d', fontWeight: 'bold' },
    btnDelete: { backgroundColor: '#FFEBEE', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
    btnDeleteText: { color: '#D32F2F', fontWeight: 'bold' },
    addButton: { backgroundColor: '#10b83f', padding: 16, borderRadius: 15, marginBottom: 15 },
    addButtonText: { color: '#FFF', textAlign: 'center', fontWeight: '800', fontSize: 16 },
    fullModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '98%', height: '94%', backgroundColor: '#FFF', borderRadius: 25, padding: 15 },
    modalTitle: { fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 15 },
    label: { fontSize: 13, fontWeight: 'bold', color: '#636E72', marginBottom: 5 },
    input: { backgroundColor: '#F8F9FA', padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#EDF2F7' },
    inputDisabled: { backgroundColor: '#EDF2F7', color: '#A0AEC0' },
    pickerWrapper: { backgroundColor: '#F8F9FA', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#EDF2F7', overflow: 'hidden' },
    divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 12 },
    addItemBox: { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 15 },
    smallAddBtn: { backgroundColor: '#10b83f', width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    tableHeader: { flexDirection: 'row', backgroundColor: '#F8F9FA', padding: 10, borderRadius: 10 },
    tableRow: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F3F5', alignItems: 'center' },
    totalDisplay: { fontSize: 18, fontWeight: '900', color: '#D63031', textAlign: 'right', marginTop: 20 },
    modalFooter: { flexDirection: 'row', gap: 10, marginTop: 25, marginBottom: 40 },
    btnSubmit: { flex: 1, backgroundColor: '#10b83f', padding: 16, borderRadius: 15, alignItems: 'center' },
    btnSubmitText: { color: '#FFF', fontWeight: 'bold', textAlign: 'center' },
    btnCancel: { flex: 0.6, backgroundColor: '#EDF2F7', padding: 16, borderRadius: 15, alignItems: 'center' },
    viewDetailCard: { width: '95%', backgroundColor: '#FFF', borderRadius: 25, overflow: 'hidden' },
    viewHeader: { padding: 20, alignItems: 'center', backgroundColor: '#c9ab18' },
    viewTitle: { fontSize: 18, fontWeight: '900', color: '#FFF' },
    detailText: { fontSize: 15, marginBottom: 6, color: '#636E72' },
    viewFooter: { marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#E2E8F0', alignItems: 'flex-end' },
    btnCloseView: { margin: 20, padding: 16, backgroundColor: '#636E72', borderRadius: 15, alignItems: 'center' },
    dropdownContainer: {
        backgroundColor: '#FFF', borderWidth: 1, borderColor: '#0984e3', borderRadius: 12,
        position: 'absolute', top: 55, left: 0, right: 0, maxHeight: 200, zIndex: 999, elevation: 5, overflow: 'hidden',
    },
    dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F3F5' },
    dropdownItemText: { fontSize: 14, color: '#2D3436' },
});