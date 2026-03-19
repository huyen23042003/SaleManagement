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

interface Product {
    productID: string;
    productName: string;
    price: number;
}

const API_URL = "https://shaquita-benzal-isaura.ngrok-free.dev/api/Product";

export default function ProductScreen() {
    const [products, setProducts] = useState<Product[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [isEdit, setIsEdit] = useState(false);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(API_URL);
            setProducts(response.data);
        } catch (error: any) {
            console.error("Lỗi:", error.message);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    const formatNumber = (num: string) => {
        if (!num) return '';
        const cleanNumber = num.replace(/[^0-9]/g, '');
        return cleanNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const handlePriceChange = (text: string) => {
        setPrice(formatNumber(text));
    };
    const handleIdChange = (text: string) => {
        const formattedId = text.toUpperCase().replace(/\s+/g, '');
        setId(formattedId);
    }
    const handleSave = async (shouldClose: boolean = true) => {
        if (!id || !name || !price) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
            return;
        }
        const cleanPrice = price.replace(/,/g, '');
        const productData = {
            productID: id.trim().toUpperCase(),
            productName: name,
            price: parseFloat(cleanPrice)
        };

        try {
            if (isEdit) {
                await axios.put(`${API_URL}/${id}`, productData);
            } else {
                await axios.post(API_URL, productData);
            }
            resetForm();
            fetchProducts();
            if (shouldClose) setModalVisible(false);
            Alert.alert("Thành công", "Dữ liệu đã được cập nhật!");
        } catch (error: any) {
            Alert.alert("Lỗi", error.response?.data || "Không thể lưu");
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa sản phẩm này?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa",
                style: "destructive",
                onPress: async () => {
                    try {
                        await axios.delete(`${API_URL}/${id}`);
                        fetchProducts(); 
                        Alert.alert("Thành công", "Đã xóa sản phẩm");
                    } catch (error: any) {
                        Alert.alert(
                            "Lỗi xóa",
                            "Sản phẩm này đang có trong hóa đơn, không thể xóa được!"
                        );
                    }
                }
            }
        ]);
    };
    const resetForm = () => {
        setId(''); setName(''); setPrice(''); setIsEdit(false);
    };

    const renderItem = ({ item }: { item: Product }) => (
        <View style={styles.itemCard}>
            <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => {
                    setSelectedProduct(item);
                    setDetailModalVisible(true);
                }}
            >
                <Text style={styles.itemTitle}>{item.productName}</Text>
                <Text style={styles.itemIdText}>Mã: {item.productID}</Text>
                <Text style={styles.itemPriceText}>{item.price.toLocaleString()} VNĐ</Text>
            </TouchableOpacity>

            <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.btnEdit} onPress={() => {
                    setId(item.productID); setName(item.productName);
                    setPrice(formatNumber(item.price.toString())); setIsEdit(true); setModalVisible(true);
                }}>
                    <Text style={styles.btnEditText}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnDelete} onPress={() => handleDelete(item.productID)}>
                    <Text style={styles.btnDeleteText}>Xóa</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <Text style={styles.header}>DANH MỤC SẢN PHẨM</Text>

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => { resetForm(); setModalVisible(true); }}
            >
                <Text style={styles.addButtonText}>+ Thêm sản phẩm</Text>
            </TouchableOpacity>

            <FlatList
                data={products}
                keyExtractor={(item) => item.productID}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            />

            {/* Modal Thêm/Sửa */}
            <Modal visible={modalVisible} animationType="fade" transparent={true}>
                <View style={styles.centeredView}>
                    <View style={styles.modalForm}>
                        <Text style={styles.modalTitle}>{isEdit ? "Chỉnh sửa" : "Thêm mới"}</Text>

                        <Text style={styles.label}>Mã sản phẩm</Text>
                        <TextInput
                            style={[styles.input, isEdit && styles.inputDisabled]}
                            value={id}
                            onChangeText={handleIdChange}
                            editable={!isEdit}
                            autoCapitalize='characters'
                            placeholder="Ví dụ: SP001"
                        />

                        <Text style={styles.label}>Tên sản phẩm</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Nhập tên sản phẩm"
                        />

                        <Text style={styles.label}>Giá bán (VNĐ)</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={price}
                            onChangeText={handlePriceChange}
                            placeholder="0"
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
                            <Text style={styles.detailTitle}>Thông tin chi tiết</Text>
                        </View>

                        <View style={styles.detailBody}>
                            <DetailItem label="Mã sản phẩm" value={selectedProduct?.productID} />
                            <DetailItem label="Tên sản phẩm" value={selectedProduct?.productName} />
                            <DetailItem label="Giá bán" value={`${selectedProduct?.price.toLocaleString()} VNĐ`} isPrice />
                        </View>

                        <TouchableOpacity style={styles.btnDetailClose} onPress={() => setDetailModalVisible(false)}>
                            <Text style={styles.btnDetailCloseText}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const DetailItem = ({ label, value, isPrice }: any) => (
    <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={[styles.detailValue, isPrice && { color: '#2ecc71', fontWeight: 'bold' }]}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#F8F9FA' },
    header: { fontSize: 24, fontWeight: '800', color: '#1A1A1A', textAlign: 'center', marginTop: 25, marginBottom: 20 },

    itemCard: {
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemTitle: { fontSize: 17, fontWeight: '700', color: '#2D3436', marginBottom: 4 },
    itemIdText: { fontSize: 13, color: '#636E72', marginBottom: 4 },
    itemPriceText: { fontSize: 15, fontWeight: '600', color: '#2ecc71' },

    actionButtons: { flexDirection: 'column', gap: 8 },
    btnEdit: { backgroundColor: '#f5f8dd', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
    btnEditText: { color: '#aa9d0d', fontWeight: '600', fontSize: 13 },
    btnDelete: { backgroundColor: '#FFEBEE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
    btnDeleteText: { color: '#D32F2F', fontWeight: '600', fontSize: 13 },

    addButton: { backgroundColor: '#10b83f', padding: 16, borderRadius: 12, marginBottom: 20, alignItems: 'center' },
    addButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

    // Modal chung
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },

    // Form Modal
    modalForm: { width: '90%', backgroundColor: '#FFF', borderRadius: 20, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 20, color: '#1A1A1A' },
    label: { fontSize: 14, fontWeight: '600', color: '#636E72', marginBottom: 6 },
    input: { backgroundColor: '#F1F3F5', padding: 12, borderRadius: 10, marginBottom: 16, fontSize: 16 },
    inputDisabled: { backgroundColor: '#E9ECEF', color: '#ADB5BD' },

    modalFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, gap: 10 },
    btnSave: { flex: 1.5, backgroundColor: '#007AFF', padding: 14, borderRadius: 10, alignItems: 'center' },
    btnSaveText: { color: '#FFF', fontWeight: '700' },
    btnNext: { flex: 1.5, backgroundColor: '#34C759', padding: 14, borderRadius: 10, alignItems: 'center' },
    btnNextText: { color: '#FFF', fontWeight: '700' },
    btnClose: { flex: 1, backgroundColor: '#F1F3F5', padding: 14, borderRadius: 10, alignItems: 'center' },
    btnCloseText: { color: '#495057', fontWeight: '700' },

    // Detail Modal
    detailCard: { width: '85%', backgroundColor: '#FFF', borderRadius: 24, overflow: 'hidden' },
    detailHeader: { backgroundColor: '#c9ab18', padding: 20, alignItems: 'center' },
    detailTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
    detailBody: { padding: 20 },
    detailItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F3F5' },
    detailLabel: { color: '#636E72', fontSize: 14 },
    detailValue: { color: '#2D3436', fontSize: 16, fontWeight: '500' },
    btnDetailClose: { margin: 20, marginTop: 0, padding: 14, backgroundColor: '#F1F3F5', borderRadius: 12, alignItems: 'center' },
    btnDetailCloseText: { fontWeight: '700', color: '#1A1A1A' }
});