// src/api/orderDetailsApi.js - ✅ FULLY CORRECTED

import { supabase } from './supabaseClient';

// Get all order details
export async function getAllOrderDetails() {
  const { data, error } = await supabase
    .from('Order_Details')
    .select('*')
    .order('order_detail_id', { ascending: true });
  
  if (error) {
    console.error('❌ Error fetching order details:', error);
    throw error;
  }
  return data;
}

// Get order detail by ID
export async function getOrderDetailById(orderDetailId) {
  const { data, error } = await supabase
    .from('Order_Details')
    .select('*')
    .eq('order_detail_id', orderDetailId)
    .single();
  
  if (error) {
    console.error('❌ Error fetching order detail:', error);
    throw error;
  }
  return data;
}

// Get order details by order ID
export async function getOrderDetailsByOrderId(orderId) {
  const { data, error } = await supabase
    .from('Order_Details')
    .select('*')
    .eq('order_id', orderId)
    .order('order_detail_id', { ascending: true });
  
  if (error) {
    console.error('❌ Error fetching order details by order:', error);
    throw error;
  }
  return data;
}

// ✅ Get order details with dish information (JOIN)
export async function getOrderDetailsWithDish(orderId) {
  const { data, error } = await supabase
    .from('Order_Details')
    .select(`
      *,
      Dish:dish_id (
        dish_id,
        dish_name,
        price,
        category_id,
        availability_status,
        image_url
      )
    `)
    .eq('order_id', orderId)
    .order('order_detail_id', { ascending: true });
  
  if (error) {
    console.error('❌ Error fetching order details with dish:', error);
    throw error;
  }
  return data;
}

// ✅ Get complete order with all details
export async function getCompleteOrderDetails(orderId) {
  try {
    const orderDetails = await getOrderDetailsWithDish(orderId);
    
    const { data: order, error: orderError } = await supabase
      .from('Order')
      .select(`
        *,
        User:user_id (
          user_id,
          user_name,
          email,
          phone
        ),
        Waiter:waiter_id (
          waiter_id,
          name,
          email
        )
      `)
      .eq('order_id', orderId)
      .single();

    if (orderError) throw orderError;

    return {
      order,
      items: orderDetails
    };
  } catch (error) {
    console.error('❌ Error fetching complete order details:', error);
    throw error;
  }
}

// ✅ Add order detail (item to order) - MATCHES TABLE
export async function addOrderDetail(orderDetailData) {
  console.log('📝 Adding order detail:', orderDetailData);
  
  const { data, error } = await supabase
    .from('Order_Details')
    .insert([{
      order_id: orderDetailData.order_id,
      dish_id: orderDetailData.dish_id,
      quantity: orderDetailData.quantity,
      price: orderDetailData.price,
      discount: orderDetailData.discount || 0,
      status: orderDetailData.status || 'in-kitchen'
    }])
    .select();
  
  if (error) {
    console.error('❌ Error adding order detail:', error);
    throw error;
  }
  
  console.log('✅ Order detail added:', data);
  return data[0];
}

// ✅ Add multiple order details (bulk insert)
export async function addMultipleOrderDetails(orderDetailsArray) {
  console.log('📦 Adding multiple order details:', orderDetailsArray.length);
  
  const itemsWithStatus = orderDetailsArray.map(item => ({
    order_id: item.order_id,
    dish_id: item.dish_id,
    quantity: item.quantity,
    price: item.price,
    discount: item.discount || 0,
    status: item.status || 'in-kitchen'
  }));
  
  console.log('📋 Items with status:', itemsWithStatus);
  
  const { data, error } = await supabase
    .from('Order_Details')
    .insert(itemsWithStatus)
    .select();
  
  if (error) {
    console.error('❌ Error adding multiple order details:', error);
    throw error;
  }
  
  console.log('✅ Multiple order details added:', data.length);
  return data;
}

// Update order detail
export async function updateOrderDetail(orderDetailId, updatedData) {
  console.log('🔄 Updating order detail:', { orderDetailId, updatedData });
  
  const { data, error } = await supabase
    .from('Order_Details')
    .update(updatedData)
    .eq('order_detail_id', orderDetailId)
    .select();
  
  if (error) {
    console.error('❌ Error updating order detail:', error);
    throw error;
  }
  
  console.log('✅ Order detail updated:', data);
  return data[0];
}

// Update quantity
export async function updateOrderDetailQuantity(orderDetailId, quantity) {
  const { data, error } = await supabase
    .from('Order_Details')
    .update({ quantity })
    .eq('order_detail_id', orderDetailId)
    .select();
  
  if (error) {
    console.error('❌ Error updating quantity:', error);
    throw error;
  }
  return data[0];
}

// Update price
export async function updateOrderDetailPrice(orderDetailId, price) {
  const { data, error } = await supabase
    .from('Order_Details')
    .update({ price })
    .eq('order_detail_id', orderDetailId)
    .select();
  
  if (error) {
    console.error('❌ Error updating price:', error);
    throw error;
  }
  return data[0];
}

// Update discount
export async function updateOrderDetailDiscount(orderDetailId, discount) {
  const { data, error } = await supabase
    .from('Order_Details')
    .update({ discount })
    .eq('order_detail_id', orderDetailId)
    .select();
  
  if (error) {
    console.error('❌ Error updating discount:', error);
    throw error;
  }
  return data[0];
}

// ✅ Update status (NEW)
export async function updateOrderDetailStatus(orderDetailId, status) {
  const { data, error } = await supabase
    .from('Order_Details')
    .update({ status })
    .eq('order_detail_id', orderDetailId)
    .select();
  
  if (error) {
    console.error('❌ Error updating status:', error);
    throw error;
  }
  return data[0];
}

// Delete order detail
export async function deleteOrderDetail(orderDetailId) {
  const { data, error } = await supabase
    .from('Order_Details')
    .delete()
    .eq('order_detail_id', orderDetailId);
  
  if (error) {
    console.error('❌ Error deleting order detail:', error);
    throw error;
  }
  return data;
}

// Delete all order details for an order
export async function deleteAllOrderDetails(orderId) {
  const { data, error } = await supabase
    .from('Order_Details')
    .delete()
    .eq('order_id', orderId);
  
  if (error) {
    console.error('❌ Error deleting all order details:', error);
    throw error;
  }
  return data;
}

// ✅ Calculate order total
export async function calculateOrderTotal(orderId) {
  try {
    const orderDetails = await getOrderDetailsByOrderId(orderId);
    
    const subtotal = orderDetails.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      const discount = parseFloat(item.discount) || 0;
      return sum + (price * quantity - discount);
    }, 0);

    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + tax;

    return {
      subtotal,
      tax,
      discount: orderDetails.reduce((sum, item) => sum + (parseFloat(item.discount) || 0), 0),
      total,
      itemCount: orderDetails.length,
      totalQuantity: orderDetails.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0)
    };
  } catch (error) {
    console.error('❌ Error calculating order total:', error);
    throw error;
  }
}

// Get most ordered dishes
export async function getMostOrderedDishes(limit = 10) {
  try {
    const allDetails = await getAllOrderDetails();
    
    const dishCounts = allDetails.reduce((acc, detail) => {
      const dishId = detail.dish_id;
      if (!acc[dishId]) {
        acc[dishId] = {
          dish_id: dishId,
          total_quantity: 0,
          order_count: 0
        };
      }
      acc[dishId].total_quantity += parseInt(detail.quantity) || 0;
      acc[dishId].order_count += 1;
      return acc;
    }, {});

    const sorted = Object.values(dishCounts)
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, limit);

    return sorted;
  } catch (error) {
    console.error('❌ Error getting most ordered dishes:', error);
    throw error;
  }
}

// Get order details by dish ID
export async function getOrderDetailsByDish(dishId) {
  const { data, error } = await supabase
    .from('Order_Details')
    .select('*')
    .eq('dish_id', dishId)
    .order('order_detail_id', { ascending: false });
  
  if (error) {
    console.error('❌ Error fetching order details by dish:', error);
    throw error;
  }
  return data;
}

// Get revenue by dish
export async function getRevenueByDish(dishId) {
  try {
    const details = await getOrderDetailsByDish(dishId);
    
    const revenue = details.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      const discount = parseFloat(item.discount) || 0;
      return sum + (price * quantity - discount);
    }, 0);

    return revenue;
  } catch (error) {
    console.error('❌ Error calculating dish revenue:', error);
    throw error;
  }
}
// ✅ GET ALL ORDER DETAILS WITH ORDER INFO (ADD THIS)
export async function getAllOrderDetailsWithOrders() {
  try {
    const { data: orders, error: orderError } = await supabase
      .from('Order')
      .select(`
        order_id,
        customer_name,
        waiter_name,
        table_number,
        order_date,
        status
      `)
      .order('order_id', { ascending: false });

    if (orderError) throw orderError;

    // Get all order details
    const { data: details, error: detailError } = await supabase
      .from('Order_Details')
      .select(`
        *,
        Dish:dish_id (
          dish_id,
          dish_name,
          price
        )
      `)
      .order('order_id', { ascending: false });

    if (detailError) throw detailError;

    // Merge orders with their details
    const mergedData = orders.map(order => ({
      id: `ORD-${order.order_id}`,
      order_id: order.order_id,
      customerName: order.customer_name,
      waiterName: order.waiter_name,
      tableNumber: order.table_number,
      createdAt: order.order_date,
      status: order.status,
      items: details
        .filter(d => d.order_id === order.order_id)
        .map(d => ({
          order_detail_id: d.order_detail_id,
          name: d.Dish?.dish_name || 'Unknown',
          quantity: d.quantity,
          price: d.price,
          status: d.status || 'in-kitchen',
          notes: d.notes || ''
        }))
    }));

    console.log('✅ Merged orders with details:', mergedData.length);
    return mergedData;
  } catch (error) {
    console.error('❌ Error fetching merged data:', error);
    throw error;
  }
}

