import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

// Define Asset interface to match the data structure
interface Asset {
  id: string;
  asset_name: string;
  asset_symbol: string;
  wallet_address: string;
  network: string;
  balance?: number;
  fiat_value?: number;
}

const SendDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchAsset = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("asset_wallets")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();
      
      if (error) {
        console.error("Error fetching asset:", error);
        navigate("/wallet");
        return;
      }
      
      if (!data) {
        navigate("/wallet");
        return null;
      }
      
      // Transform data to match the Asset interface
      // Add default values for balance and fiat_value if they don't exist
      const assetData: Asset = {
        id: data.id,
        asset_name: data.asset_name,
        asset_symbol: data.asset_symbol,
        wallet_address: data.wallet_address,
        network: data.network,
        balance: 0, // Default value
        fiat_value: 0 // Default value
      };
      
      setAsset(assetData);
      setLoading(false);
    };
    
    fetchAsset();
  }, [id, user, navigate]);
  
  return (
    <div>
      {loading ? (
        <p>Loading asset details...</p>
      ) : asset ? (
        <>
          <h2>Send Details</h2>
          <p>Asset Name: {asset.asset_name}</p>
          <p>Asset Symbol: {asset.asset_symbol}</p>
          <p>Wallet Address: {asset.wallet_address}</p>
          <p>Network: {asset.network}</p>
          {/* Display balance and fiat_value if they exist */}
          {asset.balance !== undefined && <p>Balance: {asset.balance}</p>}
          {asset.fiat_value !== undefined && <p>Fiat Value: {asset.fiat_value}</p>}
        </>
      ) : (
        <p>Asset not found.</p>
      )}
    </div>
  );
};

export default SendDetails;
