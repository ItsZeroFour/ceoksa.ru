model = tf.keras.Sequential([
    tf.keras.layers.LSTM(256, input_shape=(5, 12), return_sequences=False),
    tf.keras.layers.RepeatVector(3),
    tf.keras.layers.LSTM(256, return_sequences=True),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.TimeDistributed(tf.keras.layers.Dense(12, activation='softmax'))
])